import { F2Market } from "@app/types"
import { useContext, useEffect } from "react";
import { useCvxCrvRewards, useCvxFxsRewards, useCvxRewards, useEscrowRewards, useINVEscrowRewards, useStakedInFirm } from "@app/hooks/useFirm";
import { F2MarketContext } from "../F2Contex";
import { BURN_ADDRESS } from "@app/config/constants";
import { zapperRefresh } from "@app/util/f2";
import { RewardsContainer } from "./RewardsContainer";
import { useAccount } from "@app/hooks/misc";
import { VStack, Text, HStack } from "@chakra-ui/react";
import { getMonthlyRate, shortenNumber } from "@app/util/markets";
import { InfoMessage } from "@app/components/common/Messages";
import { usePrices } from "@app/hooks/usePrices";

export const FirmRewardWrapper = ({
    market,
    label,
    showMarketBtn = false,
    escrow,
    onLoad
}: {
    market: F2Market
    label?: string
    escrow?: string
    showMarketBtn?: boolean
    onLoad?: (v: number) => void
}) => {
    const { escrow: escrowFromContext } = useContext(F2MarketContext);
    const _escrow = escrow?.replace(BURN_ADDRESS, '') || escrowFromContext?.replace(BURN_ADDRESS, '');
    if (!_escrow) return <></>;

    if (market.isInv) {
        return <FirmINVRewardWrapperContent
            market={market}
            label={label}
            showMarketBtn={showMarketBtn}
            escrow={_escrow}
            onLoad={onLoad}
        />
    } else if (market.name === 'cvxFXS') {        
        return <FirmCvxFxsRewardWrapperContent
            market={market}
            label={label}
            showMarketBtn={showMarketBtn}
            escrow={_escrow}
            onLoad={onLoad}
        />
    } else if (market.name === 'cvxCRV') {        
        return <FirmCvxCrvRewardWrapperContent
            market={market}
            label={label}
            showMarketBtn={showMarketBtn}
            escrow={_escrow}
            onLoad={onLoad}
        />
    } else if (market.name === 'CVX') {   
        return <FirmCvxRewardWrapperContent
            market={market}
            label={label}
            showMarketBtn={showMarketBtn}
            escrow={_escrow}
            onLoad={onLoad}
        />
    }

    return <FirmRewardWrapperContent
        market={market}
        label={label}
        showMarketBtn={showMarketBtn}
        escrow={_escrow}
    />
}

export const FirmCvxCrvRewardWrapperContent = ({
    market,
    label,
    showMarketBtn = false,
    escrow,
    onLoad,
}: {
    market: F2Market
    label?: string
    escrow?: string
    showMarketBtn?: boolean
    onLoad?: (v: number) => void
}) => {
    const { rewardsInfos, isLoading } = useCvxCrvRewards(escrow);

    useEffect(() => {
        if (!onLoad || !rewardsInfos?.tokens?.length || isLoading) { return }
        const totalUsd = rewardsInfos.tokens.filter(t => t.metaType === 'claimable')
            .reduce((prev, curr) => prev + curr.balanceUSD, 0);
        onLoad(totalUsd);
    }, [rewardsInfos, onLoad])

    return <FirmRewards
        market={market}
        escrow={escrow}
        rewardsInfos={rewardsInfos}
        label={label}
        showMarketBtn={showMarketBtn}
        isLoading={isLoading}
    />
}

export const FirmCvxRewardWrapperContent = ({
    market,
    label,
    showMarketBtn = false,
    escrow,
    onLoad,
}: {
    market: F2Market
    label?: string
    escrow?: string
    showMarketBtn?: boolean
    onLoad?: (v: number) => void
}) => {
    const { rewardsInfos, extraRewards, isLoading } = useCvxRewards(escrow);

    useEffect(() => {
        if (!onLoad || !rewardsInfos?.tokens?.length || isLoading) { return }
        const totalUsd = rewardsInfos.tokens.filter(t => t.metaType === 'claimable')
            .reduce((prev, curr) => prev + curr.balanceUSD, 0);
        onLoad(totalUsd);
    }, [rewardsInfos, onLoad])

    return <FirmRewards
        market={market}
        escrow={escrow}
        rewardsInfos={rewardsInfos}
        extraRewards={extraRewards}
        label={label}
        showMarketBtn={showMarketBtn}
        isLoading={isLoading}
    />
}

export const FirmCvxFxsRewardWrapperContent = ({
    market,
    label,
    showMarketBtn = false,
    escrow,
    onLoad,
}: {
    market: F2Market
    label?: string
    escrow?: string
    showMarketBtn?: boolean
    onLoad?: (v: number) => void
}) => {
    const { rewardsInfos, isLoading } = useCvxFxsRewards(escrow);

    useEffect(() => {
        if (!onLoad || !rewardsInfos?.tokens?.length || isLoading) { return }
        const totalUsd = rewardsInfos.tokens.filter(t => t.metaType === 'claimable')
            .reduce((prev, curr) => prev + curr.balanceUSD, 0);
        onLoad(totalUsd);
    }, [rewardsInfos, onLoad])

    return <FirmRewards
        market={market}
        escrow={escrow}
        rewardsInfos={rewardsInfos}
        label={label}
        showMarketBtn={showMarketBtn}
        isLoading={isLoading}
    />
}

export const FirmRewardWrapperContent = ({
    market,
    label,
    showMarketBtn = false,
    escrow,
}: {
    market: F2Market
    label?: string
    escrow?: string
    showMarketBtn?: boolean
}) => {
    const { needRefreshRewards, setNeedRefreshRewards, account } = useContext(F2MarketContext);
    const { appGroupPositions, isLoading } = useEscrowRewards(escrow);
    const rewardsInfos = appGroupPositions.find(a => a.appGroup === market.zapperAppGroup);

    useEffect(() => {
        if (!account || !needRefreshRewards) { return }
        zapperRefresh(account);
        setNeedRefreshRewards(false);
    }, [needRefreshRewards, account]);

    return <FirmRewards
        market={market}
        escrow={escrow}
        rewardsInfos={rewardsInfos}
        label={label}
        showMarketBtn={showMarketBtn}
        isLoading={isLoading}
    />
}

export const FirmINVRewardWrapperContent = ({
    market,
    label,
    showMarketBtn = false,
    escrow,
    onLoad,
}: {
    market: F2Market
    label?: string
    escrow?: string
    showMarketBtn?: boolean
    onLoad?: (v: number) => void
}) => {
    const account = useAccount();
    const { prices } = usePrices();
    const { rewardsInfos, isLoading } = useINVEscrowRewards(escrow);
    const { stakedInFirm } = useStakedInFirm(account);

    useEffect(() => {
        if (!onLoad || !rewardsInfos?.tokens?.length || isLoading) { return }
        const totalUsd = rewardsInfos.tokens.filter(t => t.metaType === 'claimable')
            .reduce((prev, curr) => prev + curr.balanceUSD, 0);
        onLoad(totalUsd);
    }, [rewardsInfos, onLoad])

    const share = market.invStakedViaDistributor ? stakedInFirm / market.invStakedViaDistributor : 0;
    const invMonthlyRewards = getMonthlyRate(stakedInFirm, market?.supplyApy);
    const dbrMonthlyRewards = share * market?.dbrYearlyRewardRate / 12;
    const invPriceCg = prices ? prices['inverse-finance']?.usd : 0;
    const dbrPriceCg = prices ? prices['dola-borrowing-right']?.usd : 0;

    return <FirmRewards
        market={market}
        rewardsInfos={rewardsInfos}
        label={label}
        showMarketBtn={showMarketBtn}
        isLoading={isLoading}
        escrow={escrow}
        extra={<VStack alignItems="flex-end" justify="center" w={{ base: 'auto', md: '700px' }}>
            {
                market?.invStakedViaDistributor &&
                <InfoMessage
                    alertProps={{ fontSize: '18px' }}
                    description={
                        <VStack alignItems="flex-start">
                            <HStack w='full' justify="space-between" spacing="2">
                                <Text>Monthly INV rewards:</Text>
                                <Text textAlign="right" fontWeight="bold">~{shortenNumber(invMonthlyRewards, 2)} ({shortenNumber(invMonthlyRewards * invPriceCg, 2, true)})</Text>
                            </HStack>
                            <HStack w='full' justify="space-between" spacing="2">
                                <Text>Monthly DBR rewards:</Text>
                                <Text textAlign="right" fontWeight="bold">~{shortenNumber(dbrMonthlyRewards, 2)} ({shortenNumber(dbrMonthlyRewards * dbrPriceCg, 2, true)})</Text>
                            </HStack>
                        </VStack>
                    }
                />
            }
        </VStack>}
    />
}

export const FirmRewards = ({
    market,
    rewardsInfos,
    extraRewards,
    label,
    showMarketBtn = false,
    isLoading,
    escrow,
    extra,
}: {
    market: F2Market
    rewardsInfos: any[]
    extraRewards?: string[]
    label?: string
    escrow?: string
    showMarketBtn?: boolean
    isLoading?: boolean
    extra?: any
}) => {
    const { escrow: escrowFromContext } = useContext(F2MarketContext);
    const _escrow = escrow?.replace(BURN_ADDRESS, '') || escrowFromContext?.replace(BURN_ADDRESS, '');

    const claimables = rewardsInfos?.tokens.filter(t => t.metaType === 'claimable' && t.balanceUSD > 0.01);
    claimables?.sort((a, b) => b.balanceUSD - a.balanceUSD)
    const totalRewardsUSD = claimables?.reduce((prev, curr) => prev + curr.balanceUSD, 0);

    if (isLoading) {
        return <></>
    }
    return <RewardsContainer
        timestamp={rewardsInfos?.timestamp}
        label={label || `${market?.name} Market Rewards`}
        escrow={_escrow}
        claimables={claimables}
        totalRewardsUSD={totalRewardsUSD}
        market={market}
        showMarketBtn={showMarketBtn}
        defaultCollapse={false}
        extra={extra}
        extraRewards={extraRewards}
    />
}