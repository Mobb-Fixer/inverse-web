
import { useEscrowBalanceEvolution, useFirmMarketEvolution, useHistoricalPrices, useINVEscrowRewards } from "@app/hooks/useFirm";
import { F2Market } from "@app/types";
import { useContext, useEffect, useState } from "react";
import { useAccount } from "@app/hooks/misc";
import { timestampToUTC } from "@app/util/misc";
import { ONE_DAY_MS } from "@app/config/constants";
import { F2MarketContext } from "./F2Contex";
import { WorthEvoChart } from "./WorthEvoChart";
import { useMediaQuery } from "@chakra-ui/react";
import { usePrices } from "@app/hooks/usePrices";
import { useDBRPrice } from "@app/hooks/useDBR";

const maxWidth = 1250;

const useFirmUserPositionEvolution = (
    market: F2Market,
    currentClaimableDbrRewards = 0,
) => {
    const account = useAccount();

    const { deposits, escrow, debt } = useContext(F2MarketContext);
    const { prices: histoPrices } = useHistoricalPrices(market.underlying.coingeckoId);
    const { prices: dbrPrices } = useHistoricalPrices('dola-borrowing-right');
    const { prices } = usePrices();
    const { price: dbrPrice } = useDBRPrice();
    const { events: _events, depositedByUser, lastBlock } = useFirmMarketEvolution(market, account);
    
    const { evolution: escrowBalanceEvolution, timestamps } = useEscrowBalanceEvolution(account, escrow, market.address, lastBlock);
    const events = _events?.map(e => ({ ...e, timestamp: e.timestamp || timestamps[e.blockNumber] })).filter(e => !!e.timestamp);

    const start = events ? events.find(e => e.actionName === 'Deposit')?.timestamp : undefined;

    const collateralRewards = Math.max((deposits) - depositedByUser, 0);

    const pricesAtEvents = events.map(e => {
        const price = histoPrices.find(p => timestampToUTC(p[0]) === timestampToUTC(e.timestamp))?.[1];
        return [e.timestamp, price];
    }).filter(p => p[0] && !!p[1]);

    const now = Date.now();

    const allPrices = [
        ...pricesAtEvents,
        ...histoPrices,
        [now, histoPrices.find(p => timestampToUTC(p[0]) === timestampToUTC(now))?.[1] || 0],
    ].sort((a, b) => a[0] - b[0]);

    const relevantPrices = allPrices
        .filter(p => p[0] > start - ONE_DAY_MS * 2);

    const currentPrice = prices ? prices[market.underlying.coingeckoId] || 0 : 0;

    const data = relevantPrices.map((p, i) => {
        const event = events.find(e => !e.isClaim && e.timestamp === p[0]);
        const histoEscrowDataFromApi = escrowBalanceEvolution?.findLast(e => e.timestamp <= p[0]);
        const histoEscrowBalance = histoEscrowDataFromApi?.balance;
        const histoEscrowDbrClaimable = histoEscrowDataFromApi?.dbrClaimable;
        const lastCollateralEvent = events.findLast(e => !e.isClaim && e.timestamp <= p[0]);
        const unstakedCollateralBalance = Math.max(lastCollateralEvent?.unstakedCollateralBalance || 0, 0);
        const balance = histoEscrowBalance || unstakedCollateralBalance;
        const debt = Math.max(lastCollateralEvent?.debt || 0, 0);
        const claimEvent = (!event || event?.actionName !== 'ForceReplenish') ? events.find(e => e.isClaim && e.timestamp === p[0]) : undefined;
        const lastClaimEvent = events.findLast(e => e.isClaim && e.timestamp <= p[0]);
        const claims = lastClaimEvent?.claims || 0;
        const dbrHistoPrice = dbrPrices.find(dbrPrice => timestampToUTC(dbrPrice[0]) === timestampToUTC(p[0]))?.[1] || 0;
        const timeProgression = (p[0] - start) / (now - start);

        const estimatedStakedBonus = balance - unstakedCollateralBalance;
        const rewardsUsd = ((claims + histoEscrowDbrClaimable) * dbrHistoPrice) || 0;
        const estimatedStakedBonusUsd = estimatedStakedBonus * p[1];
        return {
            timestamp: p[0],
            histoPrice: p[1],
            dbrPrice: dbrHistoPrice,
            eventName: !!claimEvent ? 'Claim' : event?.actionName,
            claimEvent,
            isClaimEvent: !!claimEvent,
            isEvent: !!event,
            event,
            depositsOnlyWorth: unstakedCollateralBalance * p[1],
            balanceWorth: balance * p[1],
            totalWorth: rewardsUsd + balance * p[1],
            totalRewardsUsd: rewardsUsd + estimatedStakedBonusUsd,
            // TODO: histo price dola
            debtUsd: debt,
            debt,
            balance,
            depositedByUser,
            dbrClaimed: claims,
            dbrRewards: claims + histoEscrowDbrClaimable,
            dbrClaimable: histoEscrowDbrClaimable,
            timeProgression,
            estimatedStakedBonus,
            estimatedStakedBonusUsd,
            rewardsUsd,
        }
    });

    const hasData = data?.length > 0;

    if (!start || !hasData || !events.length) {
        return null;
    }

    const dbrRewards = (data[data.length - 1].dbrClaimed + currentClaimableDbrRewards);
    const rewardsUsd = dbrRewards * dbrPrice;

    data.push({
        ...data[data.length - 1],
        histoPrice: currentPrice,
        dbrPrice,
        isEvent: false,
        isClaimEvent: false,
        timeProgression: 1,
        timestamp: now,
        debt,
        debtUsd: debt,
        balance: deposits,
        balanceWorth: deposits * currentPrice,
        totalWorth: deposits * currentPrice + rewardsUsd,
        estimatedStakedBonus: collateralRewards,
        estimatedStakedBonusUsd: collateralRewards * currentPrice,
        totalRewardsUsd: rewardsUsd + collateralRewards * currentPrice,
        rewardsUsd,
        dbrRewards,
    });

    return data;
}

export const WorthEvoChartWrapper = ({
    market
}: {
    market: F2Market,
}) => {
    const { escrow } = useContext(F2MarketContext);
    const [chartWidth, setChartWidth] = useState<number>(maxWidth);
    const [isLargerThan] = useMediaQuery(`(min-width: ${maxWidth + 50}px)`)

    useEffect(() => {
        setChartWidth(isLargerThan ? maxWidth : (screen.availWidth || screen.width) - 50)
    }, [isLargerThan, maxWidth]);

    if(!escrow) {
        return null
    }

    if(market.isInv) {
        return <WorthEvoChartContainerINV chartWidth={chartWidth} market={market} />
    }

    return <WorthEvoChartContainer chartWidth={chartWidth} market={market} />
}

export const WorthEvoChartContainer = ({
    market,
    chartWidth,
}: {
    market: F2Market,
    chartWidth: number,
}) => {
    const data = useFirmUserPositionEvolution(market);

    if(!data) {
        return null
    }

    return <WorthEvoChart
        chartWidth={chartWidth}
        market={market}
        data={data}
    />
}

export const WorthEvoChartContainerINV = ({
    market,
    chartWidth,
}: {
    market: F2Market,
    chartWidth: number,
}) => {
    const { escrow } = useContext(F2MarketContext);
    const { rewards } = useINVEscrowRewards(escrow);
    const data = useFirmUserPositionEvolution(market, rewards);

    if(!data) {
        return null
    }

    return <WorthEvoChart
        market={market}
        chartWidth={chartWidth}
        data={data}
    />
}