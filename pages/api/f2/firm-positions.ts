import { Contract } from 'ethers'
import 'source-map-support'
import { F2_MARKET_ABI, F2_SIMPLE_ESCROW } from '@app/config/abis'
import { getNetworkConfigConstants } from '@app/util/networks'
import { getProvider } from '@app/util/providers';
import { getCacheFromRedis, redisSetWithTimestamp } from '@app/util/redis'
import { getBnToNumber } from '@app/util/markets'
import { CHAIN_ID } from '@app/config/constants';
import { CHAIN_TOKENS, getToken } from '@app/variables/tokens';

const { F2_MARKETS } = getNetworkConfigConstants();

export default async function handler(req, res) {
  const cacheKey = `f2shortfalls-v1.0.0`;
  const uniqueUsersCache = `f2unique-users-v1.0.4`;
  const isShortfallOnly = req.query?.shortfallOnly === 'true';

  try {
    const validCache = await getCacheFromRedis(cacheKey, true, 30);
    if (validCache) {
      res.status(200).json(validCache);
      return
    }

    const provider = getProvider(CHAIN_ID);

    const uniqueUsersCacheData = (await getCacheFromRedis(uniqueUsersCache, false)) || {
      latestBlockNumber: undefined,
      marketUsersAndEscrows: {  }, // with marketAddress: { users: [], escrows: [] }
    };
    let { latestBlockNumber, marketUsersAndEscrows } = uniqueUsersCacheData;
    const afterLastBlock = latestBlockNumber !== undefined ? latestBlockNumber + 1 : undefined;

    const escrowCreations = await Promise.all(
      F2_MARKETS.map(m => {
        const market = new Contract(m.address, F2_MARKET_ABI, provider);
        return market.queryFilter(market.filters.CreateEscrow(), afterLastBlock);
      })
    );

    escrowCreations.forEach((marketEscrows, marketIndex) => {
      const market = F2_MARKETS[marketIndex];
      if(!marketUsersAndEscrows[market.address]) {
        marketUsersAndEscrows[market.address] = { users: [], escrows: [] };
      }
      marketEscrows.forEach(escrowCreationEvent => {
        if (!marketUsersAndEscrows[market.address].users.includes(escrowCreationEvent.args[0])) {
          marketUsersAndEscrows[market.address].users.push(escrowCreationEvent.args[0]);
          marketUsersAndEscrows[market.address].escrows.push(escrowCreationEvent.args[1]);
        }
        if (escrowCreationEvent.blockNumber > latestBlockNumber) {
          latestBlockNumber = escrowCreationEvent.blockNumber;
        }
      });
    });

    await redisSetWithTimestamp(uniqueUsersCache, { latestBlockNumber: latestBlockNumber, marketUsersAndEscrows });

    const usedMarkets = Object.keys(marketUsersAndEscrows);

    const groupedLiqDebt =
      await Promise.all(
        usedMarkets
          .map(marketAd => {
            const market = new Contract(marketAd, F2_MARKET_ABI, provider);
            return Promise.all(
              marketUsersAndEscrows[marketAd].users.map(u => {
                return market.getLiquidatableDebt(u);
              })
            )
          })
      );

    const filtered = usedMarkets.map((marketAd, usedMarketIndex) => {
      const marketIndex = F2_MARKETS.findIndex(m => m.address === marketAd);
      return marketUsersAndEscrows[marketAd].users.map((user, userIndex) => {
        return {
          marketIndex,
          user,
          liquidatableDebt: getBnToNumber(groupedLiqDebt[usedMarketIndex][userIndex]),
        }
      });
    })
      .flat()
      .filter(d => !isShortfallOnly || (isShortfallOnly && d.liquidatableDebt > 0));

    const [debtsBn, depositsBn] = await Promise.all(
      [
        await Promise.all(filtered.map((f, i) => {
          const market = new Contract(F2_MARKETS[f.marketIndex].address, F2_MARKET_ABI, provider);
          return market.debts(f.user);
        })),
        await Promise.all(filtered.map((f, i) => {
          const marketAd = F2_MARKETS[f.marketIndex].address;
          const users = marketUsersAndEscrows[marketAd].users;     
          const escrow = new Contract(marketUsersAndEscrows[marketAd].escrows[users.indexOf(f.user)], F2_SIMPLE_ESCROW, provider);
          return escrow.balance();
        })),
      ]
    );
    const deposits = depositsBn.map((bn, i) => getBnToNumber(bn, getToken(CHAIN_TOKENS[CHAIN_ID], F2_MARKETS[filtered[i].marketIndex].collateral)?.decimals));
    const debts = debtsBn.map((bn) => getBnToNumber(bn));

    const positions = filtered.map((f, i) => {
      return {
        ...f,
        deposits: deposits[i],
        debt: debts[i],
      }
    });

    const resultData = {
      positions,
      marketUsersAndEscrows,
      timestamp: +(new Date()),
    }

    await redisSetWithTimestamp(cacheKey, resultData);

    res.status(200).json(resultData)
  } catch (err) {
    console.error(err);
    // if an error occured, try to return last cached results
    try {
      const cache = await getCacheFromRedis(cacheKey, false);
      if (cache) {
        console.log('Api call failed, returning last cache found');
        res.status(200).json(cache);
      } else {
        res.status(500).json({ success: false });
      }
    } catch (e) {
      console.error(e);
      res.status(500).json({ success: false });
    }
  }
}