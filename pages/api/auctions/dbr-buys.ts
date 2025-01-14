
import 'source-map-support'
import { getProvider } from '@app/util/providers';
import { getCacheFromRedis, getCacheFromRedisAsObj, redisSetWithTimestamp } from '@app/util/redis'
import { getBnToNumber } from '@app/util/markets'
import { getDbrAuctionContract } from '@app/util/dbr-auction';
import { addBlockTimestamps } from '@app/util/timestamps';
import { NetworkIds } from '@app/types';
import { getSdolaContract } from '@app/util/dola-staking';
import { ascendingEventsSorter } from '@app/util/misc';

const DBR_AUCTION_BUYS_CACHE_KEY = 'dbr-auction-buys-v1.0.1'

export default async function handler(req, res) {
    try {
        const cacheDuration = 60;
        res.setHeader('Cache-Control', `public, max-age=${cacheDuration}`);
        const { data: cachedData, isValid } = await getCacheFromRedisAsObj(DBR_AUCTION_BUYS_CACHE_KEY, true, cacheDuration);
        if (!!cachedData && isValid) {
            res.status(200).send(cachedData);
            return
        }

        const provider = getProvider(NetworkIds.mainnet);
        const dbrAuctionContract = getDbrAuctionContract(provider);
        const sdolaContract = getSdolaContract(provider);

        const archived = cachedData || { buys: [] };
        const pastTotalEvents = archived?.buys || [];

        const lastKnownEvent = pastTotalEvents?.length > 0 ? (pastTotalEvents[pastTotalEvents.length - 1]) : {};
        const newStartingBlock = lastKnownEvent?.blockNumber ? lastKnownEvent?.blockNumber + 1 : undefined;

        const [generalAuctionBuys, sdolaAuctionBuys] = await Promise.all([
            dbrAuctionContract.queryFilter(
                dbrAuctionContract.filters.Buy(),            
                newStartingBlock ? newStartingBlock : 0x0,
            ),
            sdolaContract.queryFilter(
                sdolaContract.filters.Buy(),            
                newStartingBlock ? newStartingBlock : 0x0,
            )
        ]);

        const newBuyEvents = generalAuctionBuys.concat(sdolaAuctionBuys);
        newBuyEvents.sort(ascendingEventsSorter);

        const blocks = newBuyEvents.map(e => e.blockNumber);

        const timestamps = await addBlockTimestamps(
            blocks,
            '1',
        );

        const newBuys = newBuyEvents.map(e => {
            return {
                txHash: e.transactionHash,
                timestamp: timestamps[NetworkIds.mainnet][e.blockNumber] * 1000,
                blockNumber: e.blockNumber,
                caller: e.args[0],
                to: e.args[1],
                dolaIn: getBnToNumber(e.args[2]),
                dbrOut: getBnToNumber(e.args[3]),
                auctionType: e.address === sdolaContract.address ? 'sDOLA' : 'Virtual',
            };
        });

        const resultData = {
            timestamp: Date.now(),
            buys: pastTotalEvents.concat(newBuys),
        };

        await redisSetWithTimestamp(DBR_AUCTION_BUYS_CACHE_KEY, resultData);

        res.status(200).send(resultData);
    } catch (err) {
        console.error(err);
        // if an error occured, try to return last cached results
        try {
            const cache = await getCacheFromRedis(DBR_AUCTION_BUYS_CACHE_KEY, false);
            if (cache) {
                console.log('Api call failed, returning last cache found');
                res.status(200).send(cache);
            } else {
                res.status(500).send({})
            }
        } catch (e) {
            console.error(e);
            res.status(500).send({})
        }
    }
}