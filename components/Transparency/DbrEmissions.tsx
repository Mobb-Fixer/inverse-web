import { FormControl, HStack, Stack, Switch, useMediaQuery, Text, Divider } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useDBREmissions } from "@app/hooks/useFirm";
import { useEventsAsChartData } from "@app/hooks/misc";
import { DefaultCharts } from "./DefaultCharts";
import { ONE_DAY_MS } from "@app/config/constants";
import { AreaChart } from "./AreaChart";

const initEvent = { blocknumber: 16196827, timestamp: 1671148800000, txHash: '', amount: 4646000 };
const streamingStartTs = 1684713600000;

export const DbrEmissions = ({
    maxChartWidth = 800,
    yearlyRewardRate,
    rewardRate,
    replenishments,
}: {
    maxChartWidth: number
    yearlyRewardRate: number
    rewardRate: number
    replenishments: any[]
}) => {
    const [includeInitialEmission, setIncludeInitialEmission] = useState(false);
    const [includeReplenishments, setIncludeReplenishments] = useState(true);
    const [includeClaims, setIncludeClaims] = useState(true);

    const now = +(new Date());
    // const inOneYear = now + ONE_DAY_MS * 365;
    // const deltaSec = (now - streamingStartTs) / 1000
    // const amountSinceStart = rewardRate * deltaSec;

    // const theoreticalStreaming = [
    //     { amount: 0, timestamp: streamingStartTs },
    //     { amount: amountSinceStart, timestamp: now },
    //     { amount: yearlyRewardRate, timestamp: inOneYear },
    // ];
    // if(includeInitialEmission) {
    //     theoreticalStreaming.unshift(initEvent);
    // }
    const annualizedEmissions = [
        { amount: 0, timestamp: streamingStartTs - ONE_DAY_MS * 3 },
        { amount: yearlyRewardRate, timestamp: streamingStartTs },        
        { amount: yearlyRewardRate, timestamp: now },
    ];

    const [isSmooth, setIsSmooth] = useState(true);
    const repHashes = replenishments?.map(r => r.txHash) || [];
    const { events: emissionEvents } = useDBREmissions();

    const filteredEvents = includeReplenishments && includeClaims ?
        emissionEvents :
        emissionEvents?.filter(e => {
            return includeReplenishments ? repHashes.includes(e.txHash) : !repHashes.includes(e.txHash);
        });
    const _events = includeInitialEmission ? [initEvent, ...filteredEvents] : filteredEvents;

    const { chartData: emissionChartData } = useEventsAsChartData(_events, '_auto_', 'amount');
    // const { chartData: theoreticalStreamingChartData } = useEventsAsChartData(theoreticalStreaming, '_auto_', 'amount', false, false);
    const { chartData: annualizedEmissionsChartData } = useEventsAsChartData(annualizedEmissions, 'amount', 'amount', false, false);

    const [chartWidth, setChartWidth] = useState<number>(maxChartWidth);
    const [isLargerThan] = useMediaQuery(`(min-width: ${maxChartWidth}px)`);

    useEffect(() => {
        setChartWidth(isLargerThan ? maxChartWidth : (screen.availWidth || screen.width) - 40)
    }, [isLargerThan]);

    return <Stack w='full' direction={{ base: 'column' }}>
        <HStack pb="2" spacing="4" justify="space-between" alignItems="center" w='full'>
            <HStack spacing="4" justify="flex-start" alignItems="center">
                <FormControl w='auto' cursor="pointer" justifyContent="flex-start" display='inline-flex' alignItems='center'>
                    <Text mr="2" onClick={() => setIncludeInitialEmission(!includeInitialEmission)}>
                        Initial issuance
                    </Text>
                    <Switch onChange={(e) => setIncludeInitialEmission(!includeInitialEmission)} size="sm" colorScheme="purple" isChecked={includeInitialEmission} />
                </FormControl>
                <FormControl w='auto' cursor="pointer" justifyContent="flex-start" display='inline-flex' alignItems='center'>
                    <Text mr="2" onClick={() => setIncludeReplenishments(!includeReplenishments)}>
                        Forced replenishments
                    </Text>
                    <Switch onChange={(e) => setIncludeReplenishments(!includeReplenishments)} size="sm" colorScheme="purple" isChecked={includeReplenishments} />
                </FormControl>
                <FormControl w='auto' cursor="pointer" justifyContent="flex-start" display='inline-flex' alignItems='center'>
                    <Text mr="2" onClick={() => setIncludeClaims(!includeClaims)}>
                        Claimed by stakers
                    </Text>
                    <Switch onChange={(e) => setIncludeClaims(!includeClaims)} size="sm" colorScheme="purple" isChecked={includeClaims} />
                </FormControl>
            </HStack>
            <FormControl w='auto' cursor="pointer" justifyContent="flex-start" display='inline-flex' alignItems='center'>
                <Text mr="2" onClick={() => setIsSmooth(!isSmooth)}>
                    Smooth line?
                </Text>
                <Switch onChange={(e) => setIsSmooth(!isSmooth)} size="sm" colorScheme="blue" isChecked={isSmooth} />
            </FormControl>
        </HStack>
        <DefaultCharts
            chartData={emissionChartData}
            maxChartWidth={chartWidth}
            isDollars={false}
            showMonthlyBarChart={true}
            areaProps={{
                interpolation: isSmooth ? "basis" : "stepAfter",
                title: "DBR issuance over time",
                domainYpadding: "auto",
            }}
            barProps={{
                eventName: 'Issuance',
                title: 'DBR issuance in the last 12 months'
            }}
        />
        <Divider />
        {/* <AreaChart
            title="Theoretical Emissions Evolution"
            width={chartWidth}
            data={theoreticalStreamingChartData}
            interpolation="linear"
            id="theoretical-streaming"
            showMaxY={false}
        /> */}
        <AreaChart
            title="DBR annualized issuance over time"
            width={chartWidth}
            data={annualizedEmissionsChartData}
            interpolation="stepAfter"
            id="annualized-streaming"
            showMaxY={false}
            domainYpadding={1000000}
        />
    </Stack>
}