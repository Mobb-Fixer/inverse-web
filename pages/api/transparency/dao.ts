import { BigNumber, Contract } from 'ethers'
import 'source-map-support'
import { CTOKEN_ABI, DOLA_ABI, ERC20_ABI, INV_ABI, MULTISIG_ABI } from '@app/config/abis'
import { getNetworkConfig, getNetworkConfigConstants } from '@app/util/networks'
import { getProvider } from '@app/util/providers';
import { getCacheFromRedis, redisSetWithTimestamp } from '@app/util/redis'
import { Fed, NetworkIds, Token } from '@app/types';
import { getBnToNumber } from '@app/util/markets'
import { CHAIN_TOKENS, getToken } from '@app/variables/tokens';

const formatBn = (bn: BigNumber, token: Token) => {
  return { token, balance: getBnToNumber(bn, token.decimals) }
}

export default async function handler(req, res) {

  const { DOLA, INV, DAI, INVDOLASLP, ANCHOR_TOKENS, UNDERLYING, USDC, WCOIN, FEDS, TREASURY, MULTISIGS, TOKENS, OP_BOND_MANAGER, DOLA3POOLCRV } = getNetworkConfigConstants(NetworkIds.mainnet);
  const ftmConfig = getNetworkConfig(NetworkIds.ftm, false);
  const cacheKey = `dao-cache-v1.1.8`;

  try {

    const validCache = await getCacheFromRedis(cacheKey, true, 300);
    if (validCache) {
      res.status(200).json(validCache);
      return
    }

    const provider = getProvider(NetworkIds.mainnet);
    const dolaContract = new Contract(DOLA, DOLA_ABI, provider);
    const invContract = new Contract(INV, INV_ABI, provider);

    let invFtmTotalSupply = BigNumber.from('0');
    let dolaFtmTotalSupply = BigNumber.from('0');

    // public rpc for fantom, less reliable
    try {
      const ftmProvider = getProvider(NetworkIds.ftm);
      const dolaFtmContract = new Contract(ftmConfig?.DOLA, ERC20_ABI, ftmProvider);
      const invFtmContract = new Contract(ftmConfig?.INV, ERC20_ABI, ftmProvider);
      dolaFtmTotalSupply = await dolaFtmContract.totalSupply();
      invFtmTotalSupply = await invFtmContract.totalSupply();
    } catch (e) {

    }

    const [
      dolaTotalSupply,
      invTotalSupply,
      dolaOperator,
      ...fedData
    ] = await Promise.all([
      dolaContract.totalSupply(),
      invContract.totalSupply(),
      dolaContract.operator(),
      ...FEDS.map((fed: Fed) => {
        const fedContract = new Contract(fed.address, fed.abi, getProvider(fed.chainId));
        return Promise.all([
          fedContract[fed.isXchain ? 'dstSupply' : 'supply'](),
          fedContract[fed.isXchain ? 'GOV' : 'gov'](),
          fedContract['chair'](),
        ]);
      }),
    ])

    const treasuryFundsToCheck = [DOLA, INV, DAI, USDC, INVDOLASLP, DOLA3POOLCRV];
    const treasuryBalances = await Promise.all([
      ...treasuryFundsToCheck.map((ad: string) => {
        const contract = new Contract(ad, ERC20_ABI, provider);
        return contract.balanceOf(TREASURY);
      }),
    ])

    const anchorReserves = await Promise.all([
      ...ANCHOR_TOKENS.map((ad: string) => {
        const contract = new Contract(ad, CTOKEN_ABI, provider);
        return contract.totalReserves();
      }),
    ]);

    const multisigsToShow = MULTISIGS;

    // Multisigs
    const multisigsOwners = await Promise.all([
      ...multisigsToShow.map((m) => {
        const provider = getProvider(m.chainId);
        const contract = new Contract(m.address, MULTISIG_ABI, provider);
        return contract.getOwners();
      })
    ])

    const multisigsThresholds = await Promise.all([
      ...multisigsToShow.map((m) => {
        const provider = getProvider(m.chainId);
        const contract = new Contract(m.address, MULTISIG_ABI, provider);
        return contract.getThreshold();
      })
    ])


    const ftmTokens = CHAIN_TOKENS[NetworkIds.ftm];
    const multisigsFundsToCheck = {
      [NetworkIds.mainnet]: [INV, DOLA, DAI, WCOIN, INVDOLASLP, DOLA3POOLCRV],
      [NetworkIds.ftm]: [
        ftmConfig?.INV,
        ftmConfig?.DOLA,
        getToken(ftmTokens, "DOLA-2POOL")?.address,
        getToken(ftmTokens, "SPOOKY-LP")?.address,
      ],
    }

    const multisigsBalanceValues: BigNumber[][] = await Promise.all([
      ...multisigsToShow.map((m) => {
        const provider = getProvider(m.chainId);
        const chainFundsToCheck = multisigsFundsToCheck[m.chainId];
        return Promise.all(
          chainFundsToCheck.map(tokenAddress => {
            const contract = new Contract(tokenAddress, ERC20_ABI, provider);
            return contract.balanceOf(m.address);
          })
            .concat([
              provider.getBalance(m.address),
            ])
        )
      })
    ])

    const multisigsAllowanceValues: BigNumber[][] = await Promise.all([
      ...multisigsToShow.map((m) => {
        const provider = getProvider(m.chainId);
        const chainFundsToCheck = multisigsFundsToCheck[m.chainId];
        return Promise.all(
          chainFundsToCheck.map(tokenAddress => {
            const contract = new Contract(tokenAddress, ERC20_ABI, provider);
            return contract.allowance(TREASURY, m.address);
          })
        )
      })
    ])

    const multisigsFunds = multisigsBalanceValues.map((bns, i) => {
      const multisig = multisigsToShow[i];
      const chainFundsToCheck = multisigsFundsToCheck[multisig.chainId];
      return bns.map((bn, j) => {
        const token = CHAIN_TOKENS[multisig.chainId][chainFundsToCheck[j]] || CHAIN_TOKENS[multisig.chainId]['CHAIN_COIN'];
        const allowance = multisigsAllowanceValues[i][j]
        return {
          token,
          balance: getBnToNumber(bn, token.decimals),
          allowance: allowance !== undefined ? getBnToNumber(allowance, token.decimals) : null,
        }
      })
    })

    // Bonds
    const bondTokens = [INV, DOLA, DOLA3POOLCRV, INVDOLASLP];
    const bondManagerBalances: BigNumber[] = await Promise.all(
      bondTokens.map(tokenAddress => {
        const contract = new Contract(tokenAddress, ERC20_ABI, provider);
        return contract.balanceOf(OP_BOND_MANAGER);
      })
    )

    const resultData = {
      dolaTotalSupply: getBnToNumber(dolaTotalSupply),
      invTotalSupply: getBnToNumber(invTotalSupply),
      dolaOperator,
      bonds: {
        balances: bondManagerBalances.map((bn, i) => formatBn(bn, TOKENS[bondTokens[i]])),
      },
      anchorReserves: anchorReserves.map((bn, i) => formatBn(bn, UNDERLYING[ANCHOR_TOKENS[i]])),
      treasury: treasuryBalances.map((bn, i) => formatBn(bn, TOKENS[treasuryFundsToCheck[i]])),
      fantom: {
        dolaTotalSupply: getBnToNumber(dolaFtmTotalSupply),
        invTotalSupply: getBnToNumber(invFtmTotalSupply),
      },
      multisigs: multisigsToShow.map((m, i) => ({
        ...m, owners: multisigsOwners[i], funds: multisigsFunds[i], threshold: parseInt(multisigsThresholds[i].toString()),
      })),
      feds: FEDS.map((fed, i) => ({
        ...fed,
        abi: undefined,
        supply: getBnToNumber(fedData[i][0]),
        gov: fedData[i][1],
        chair: fedData[i][2],
      }))
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
      }
    } catch (e) {
      console.error(e);
    }
  }
}