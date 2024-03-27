import { VStack, Text, HStack, Stack, Image, useInterval } from "@chakra-ui/react"
import { redeemSDola, stakeDola, unstakeDola, useDolaStakingEarnings, useStakedDola } from "@app/util/dola-staking"
import { useWeb3React } from "@web3-react/core";
import { SimpleAmountForm } from "../common/SimpleAmountForm";
import { useEffect, useMemo, useState } from "react";
import { getNetworkConfigConstants } from "@app/util/networks";
import { parseEther } from "@ethersproject/units";
import Container from "../common/Container";
import { NavButtons } from "@app/components/common/Button";
import { InfoMessage, SuccessMessage } from "@app/components/common/Messages";
import { preciseCommify } from "@app/util/misc";
import { useDOLABalance } from "@app/hooks/useDOLA";
import { useDebouncedEffect } from "@app/hooks/useDebouncedEffect";
import { useDBRPrice } from "@app/hooks/useDBR";
import { getMonthlyRate, shortenNumber } from "@app/util/markets";
import { SmallTextLoader } from "../common/Loaders/SmallTextLoader";
import { TextInfo } from "../common/Messages/TextInfo";
import { ONE_DAY_MS, SDOLA_ADDRESS, SECONDS_PER_BLOCK } from "@app/config/constants";
import { useAccount } from "@app/hooks/misc";
import { useDbrAuctionActivity } from "@app/util/dbr-auction";
import { StakeDolaInfos } from "./StakeDolaInfos";

const { DOLA } = getNetworkConfigConstants();

const StatBasic = ({ value, name, message, onClick = undefined, isLoading = false }: { value: string, message: any, onClick?: () => void, name: string, isLoading?: boolean }) => {
    return <VStack>
        {
            !isLoading ? <Text color={'secondary'} fontSize={{ base: '32px', sm: '40px' }} fontWeight="extrabold">{value}</Text>
                : <SmallTextLoader width={'100px'} />
        }
        <TextInfo message={message}>
            <Text cursor={!!onClick ? 'pointer' : undefined} textDecoration={!!onClick ? 'underline' : undefined} onClick={onClick} color={'mainTextColor'} fontSize={{ base: '16px', sm: '20px' }} fontWeight="bold">{name}</Text>
        </TextInfo>
    </VStack>
}

const STAKE_BAL_INC_INTERVAL = 100;
const MS_PER_BLOCK = SECONDS_PER_BLOCK * 1000;

export const StakeDolaUI = () => {
    const account = useAccount();
    const { provider, account: connectedAccount } = useWeb3React();
    const { priceUsd: dbrPrice, priceDola: dbrDolaPrice } = useDBRPrice();
    const { events: auctionBuys } = useDbrAuctionActivity();

    const [dolaAmount, setDolaAmount] = useState('');
    const [isConnected, setIsConnected] = useState(true);
    const [tab, setTab] = useState('Stake');
    const isStake = tab === 'Stake';

    const { apy, projectedApy, isLoading, sDolaExRate, sDolaTotalAssets, weeklyRevenue } = useStakedDola(dbrDolaPrice, !dolaAmount || isNaN(parseFloat(dolaAmount)) ? 0 : isStake ? parseFloat(dolaAmount) : -parseFloat(dolaAmount));
    const { balance: dolaBalance } = useDOLABalance(account);
    // value in sDOLA terms
    const { stakedDolaBalance, stakedDolaBalanceBn } = useDolaStakingEarnings(account);
    const [previousStakedDolaBalance, setPrevStakedDolaBalance] = useState(stakedDolaBalance);
    const [baseBalance, setBaseBalance] = useState(0);
    const [realTimeBalance, setRealTimeBalance] = useState(0);
    // value in DOLA terms
    const dolaStakedInSDola = sDolaExRate * stakedDolaBalance;
    const sDOLAamount = dolaAmount ? parseFloat(dolaAmount) / sDolaExRate : '';

    const sDolaAuctionBuys = auctionBuys.filter(e => e.auctionType === 'sDOLA')
        .reduce((prev, curr) => prev + curr.dolaIn, 0);
    const sDolaHoldersTotalEarnings = sDolaAuctionBuys - weeklyRevenue;

    useInterval(() => {
        const curr = (realTimeBalance || baseBalance);
        const incPerInterval = ((curr * (apy / 100)) * (STAKE_BAL_INC_INTERVAL / (ONE_DAY_MS * 365)));
        const neo = curr + incPerInterval;
        setRealTimeBalance(neo);
    }, STAKE_BAL_INC_INTERVAL);

    // every ~12s recheck base balance
    useInterval(() => {
        if (realTimeBalance > dolaStakedInSDola) return;
        setRealTimeBalance(dolaStakedInSDola);
        setBaseBalance(dolaStakedInSDola);
    }, MS_PER_BLOCK);

    useEffect(() => {
        if (previousStakedDolaBalance === stakedDolaBalance) return;
        setBaseBalance(dolaStakedInSDola);
        setRealTimeBalance(dolaStakedInSDola);
        setPrevStakedDolaBalance(stakedDolaBalance);
    }, [stakedDolaBalance, previousStakedDolaBalance, dolaStakedInSDola]);

    useEffect(() => {
        if (!!baseBalance || !dolaStakedInSDola) return;
        setBaseBalance(dolaStakedInSDola);
    }, [baseBalance, dolaStakedInSDola]);

    useDebouncedEffect(() => {
        setIsConnected(!!connectedAccount);
    }, [connectedAccount], 500);

    // const monthlyProjectedDolaRewards = useMemo(() => {
    //     return (projectedApy > 0 && stakedDolaBalance > 0 ? getMonthlyRate(stakedDolaBalance, projectedApy) : 0);
    // }, [stakedDolaBalance, projectedApy]);

    const monthlyDolaRewards = useMemo(() => {
        return (apy > 0 && dolaStakedInSDola > 0 ? getMonthlyRate(dolaStakedInSDola, apy) : 0);
    }, [dolaStakedInSDola, apy]);

    const handleAction = async () => {
        if (isStake) {
            return stakeDola(provider?.getSigner(), parseEther(dolaAmount));
        }
        return unstakeDola(provider?.getSigner(), parseEther(dolaAmount));
    }

    const unstakeAll = async () => {
        return redeemSDola(provider?.getSigner(), stakedDolaBalanceBn);
    }

    const resetRealTime = () => {
        setTimeout(() => {
            setBaseBalance(dolaStakedInSDola);
            setRealTimeBalance(dolaStakedInSDola);
        }, 250);
    }

    return <Stack direction={{ base: 'column', lg: 'row' }} alignItems={{ base: 'center', lg: 'flex-start' }} justify="space-around" w='full' spacing="12">
        <VStack w='full' maxW='450px' spacing='4' pt='10'>
            <HStack justify="space-around" w='full'>
                <VStack>
                    <Image src="/assets/sDOLAx512.png" h="120px" w="120px" />
                    <Text fontSize="20px" fontWeight="bold">sDOLA</Text>
                </VStack>
            </HStack>
            <HStack justify="space-between" w='full'>
                <StatBasic message="This week's APY is calculated with last week's DBR auction revenues and assuming a weekly auto-compounding" isLoading={isLoading} name="Current APY" value={apy ? `${shortenNumber(apy, 2)}%` : '0% this week'} />
                <StatBasic message={"The projected APY is a theoretical estimation of where the APY should tend to go. It's calculated by considering current's week auction revenue and a forecast that considers the DBR incentives, where the forecast portion has a weight of more than 50%"} isLoading={isLoading} name="Projected APY" value={`${shortenNumber(projectedApy, 2)}%`} />
            </HStack>
            {
                (monthlyDolaRewards > 0) && <SuccessMessage
                    showIcon={false}
                    alertProps={{ w: 'full' }}
                    description={
                        <VStack alignItems="flex-start">
                            <Stack direction={{ base: 'column', lg: 'row' }} w='full' justify="space-between">
                                <Text>- Your rewards: </Text>
                                <Text><b>~{preciseCommify(monthlyDolaRewards, 2)} DOLA per month</b></Text>
                            </Stack>
                            <Stack direction={{ base: 'column', lg: 'row' }} w='full' justify="space-between">
                                <Text>- Total earnings by all holders:</Text>
                                <Text><b>{shortenNumber(sDolaHoldersTotalEarnings, 2)} DOLA</b></Text>
                            </Stack>
                            <Stack direction={{ base: 'column', lg: 'row' }} w='full' justify="space-between">
                                <Text>- Total staked:</Text>
                                <Text><b>{shortenNumber(sDolaTotalAssets, 2)} DOLA</b></Text>
                            </Stack>
                        </VStack>
                    }
                />
            }
        </VStack>
        <Container
            label="sDOLA - Yield-Bearing stablecoin"
            description="See contract"
            href={`https://etherscan.io/address/${SDOLA_ADDRESS}`}
            noPadding
            m="0"
            p="0"
            maxW='450px'
        >
            <VStack spacing="4" alignItems="flex-start" w='full'>
                {
                    !isConnected ? <InfoMessage alertProps={{ w: 'full' }} description="Please connect your wallet" />
                        :
                        <>
                            <NavButtons active={tab} options={['Stake', 'Unstake', 'Infos']} onClick={(v) => setTab(v)} />
                            {
                                tab !== 'Infos' && <VStack alignItems="flex-start" w='full' justify="space-between">
                                    <Text fontSize="18px">
                                        DOLA balance in wallet: <b>{dolaBalance ? preciseCommify(dolaBalance, 2) : '-'}</b>
                                    </Text>
                                    <Text fontSize="18px">
                                        Staked DOLA: <b>{dolaStakedInSDola ? preciseCommify(realTimeBalance, 8) : '-'}</b>
                                    </Text>
                                </VStack>
                            }
                            {
                                tab === 'Infos' ? <StakeDolaInfos /> : isStake ?
                                    <VStack w='full' alignItems="flex-start">
                                        <Text fontSize="22px" fontWeight="bold">
                                            DOLA amount to stake:
                                        </Text>
                                        <SimpleAmountForm
                                            btnProps={{ needPoaFirst: true }}
                                            defaultAmount={dolaAmount}
                                            address={DOLA}
                                            destination={SDOLA_ADDRESS}
                                            signer={provider?.getSigner()}
                                            decimals={18}
                                            onAction={() => handleAction()}
                                            actionLabel={`Stake`}
                                            maxActionLabel={`Stake all`}
                                            onAmountChange={(v) => setDolaAmount(v)}
                                            showMaxBtn={false}
                                            showMax={true}
                                            hideInputIfNoAllowance={false}
                                            showBalance={false}
                                            onSuccess={() => resetRealTime()}
                                        />
                                    </VStack>
                                    :
                                    <VStack w='full' alignItems="flex-start">
                                        <Text fontSize="22px" fontWeight="bold">
                                            DOLA amount to unstake:
                                        </Text>
                                        <SimpleAmountForm
                                            btnProps={{ needPoaFirst: true }}
                                            defaultAmount={dolaAmount}
                                            address={SDOLA_ADDRESS}
                                            destination={SDOLA_ADDRESS}
                                            needApprove={false}
                                            signer={provider?.getSigner()}
                                            decimals={18}
                                            onAction={() => handleAction()}
                                            onMaxAction={() => unstakeAll()}
                                            maxActionLabel={`Unstake all`}
                                            actionLabel={`Unstake`}
                                            onAmountChange={(v) => setDolaAmount(v)}
                                            showMaxBtn={stakedDolaBalance > 0}
                                            showMax={false}
                                            hideInputIfNoAllowance={false}
                                            showBalance={false}
                                            onSuccess={() => resetRealTime()}
                                        />
                                        {
                                            <InfoMessage description="Note: to unstake everything use the unstake all button to avoid leaving dust" />
                                        }
                                    </VStack>
                            }
                            {
                                tab !== 'Infos' && <VStack alignItems="flex-start">
                                    <HStack>
                                        <Text fontSize="16px" color="mainTextColorLight2">
                                            {isStake ? 'sDOLA to receive' : 'sDOLA to exchange'}:
                                        </Text>
                                        <Text fontSize="16px" color="mainTextColorLight2">
                                            {sDOLAamount ? preciseCommify(sDOLAamount, 2) : '-'}
                                        </Text>
                                    </HStack>
                                    <HStack>
                                        <Text fontSize="16px" color="mainTextColorLight2">
                                            DOLA-sDOLA exchange rate:
                                        </Text>
                                        <Text fontSize="16px" color="mainTextColorLight2">
                                            {sDolaExRate ? shortenNumber(1 / sDolaExRate, 6) : '-'}
                                        </Text>
                                    </HStack>
                                </VStack>
                            }
                        </>
                }
            </VStack>
        </Container>
    </Stack>
}