import { Contract } from 'ethers'
import 'source-map-support'
import { DBR_ABI } from '@app/config/abis'
import { getNetworkConfigConstants } from '@app/util/networks'
import { getProvider } from '@app/util/providers';
import { getCacheFromRedis, getCacheFromRedisAsObj, redisSetWithTimestamp } from '@app/util/redis'
import { getBnToNumber } from '@app/util/markets'
import { BURN_ADDRESS, CHAIN_ID } from '@app/config/constants';
import { addBlockTimestamps, getCachedBlockTimestamps } from '@app/util/timestamps';
import { NetworkIds } from '@app/types';
import { dbrRewardRatesCacheKey, initialDbrRewardRates } from '../cron-dbr-distributor';

const { DBR, TREASURY } = getNetworkConfigConstants();

export default async function handler(req, res) {
    const cacheKey = `dbr-emissions-v1.0.9`;
    const { cacheFirst } = req.query;

    try {        
        res.setHeader('Cache-Control', `public, max-age=${60}`);
        const [emissionsCacheRes, ratesCache] = await Promise.all([
            getCacheFromRedisAsObj(cacheKey, cacheFirst !== 'true', 600, true),
            getCacheFromRedis(dbrRewardRatesCacheKey, false),
        ]);

        const { data: cachedData, isValid } = emissionsCacheRes;

        if (!!cachedData && isValid) {
            res.status(200).json({
                ...cachedData,
                rewardRatesHistory: (ratesCache || initialDbrRewardRates),
            });
            return
        }

        const provider = getProvider(CHAIN_ID);
        const contract = new Contract(DBR, DBR_ABI, provider);

        const pastTotalEvents = cachedData?.totalEmissions || [];

        const lastKnownEvent = pastTotalEvents?.length > 0 ? (pastTotalEvents[pastTotalEvents.length - 1]) : {};
        const newStartingBlock = lastKnownEvent ? lastKnownEvent?.blockNumber + 1 : 0;

        const newTransferEvents = await contract.queryFilter(
            contract.filters.Transfer(BURN_ADDRESS),
            newStartingBlock ? newStartingBlock : undefined,
        );

        const blocks = newTransferEvents.map(e => e.blockNumber);

        await addBlockTimestamps(
            blocks,
            NetworkIds.mainnet,
        );

        const timestamps = await getCachedBlockTimestamps();

        const newTransfers = newTransferEvents.map(e => {
            return {
                txHash: e.transactionHash,
                timestamp: timestamps[NetworkIds.mainnet][e.blockNumber] * 1000,
                blockNumber: e.blockNumber,
                amount: getBnToNumber(e.args[2]),
                isTreasuryMint: e.args[1].toLowerCase() === TREASURY.toLowerCase(),
            };
        }).filter(e => e.amount > 0);

        let accEmissions = 0;

        const resultData = {
            timestamp: +(new Date()),
            newTransfers,
            totalEmissions: pastTotalEvents.concat(newTransfers).map(e => {
                return { ...e, accEmissions: accEmissions += e.amount }
            }),
            rewardRatesHistory: (ratesCache || initialDbrRewardRates),
        };

        await redisSetWithTimestamp(cacheKey, resultData, true);

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
                res.status(500).json({ status: 'ko' });
            }
        } catch (e) {
            console.error(e);
            res.status(500).json({ status: 'ko' });
        }
    }
}