import { HStack, VStack, Text, SimpleGrid, StackProps, Flex, useMediaQuery } from '@chakra-ui/react'
import Layout from '@app/components/common/Layout'
import { AppNav } from '@app/components/common/Navbar'
import Head from 'next/head';
import { SmallTextLoader } from '@app/components/common/Loaders/SmallTextLoader';
import { preciseCommify } from '@app/util/misc';
import { DolaStakingActivity } from '@app/components/sDola/DolaStakingActivity';
import { useDolaStakingActivity, useDolaStakingEvolution, useStakedDola } from '@app/util/dola-staking';
import { useDBRPrice } from '@app/hooks/useDBR';
import { DolaStakingTabs } from '@app/components/F2/DolaStaking/DolaStakingTabs';
import { SDolaStakingEvolutionChart } from '@app/components/F2/DolaStaking/DolaStakingChart';
import { SkeletonBlob } from '@app/components/common/Skeleton';
import { shortenNumber } from '@app/util/markets';
import { useEffect, useRef, useState } from 'react';
import { useDebouncedEffect } from '@app/hooks/useDebouncedEffect';

const ChartCard = (props: StackProps & { cardTitle?: string, subtitle?: string, href?: string, imageSrc?: string }) => {
  return <Flex
    w="full"
    borderRadius={8}
    mt={0}
    p={8}
    position="relative"
    alignItems="center"
    minH="150px"
    shadow="0 0 0px 1px rgba(0, 0, 0, 0.25)"
    bg={'containerContentBackground'}
    direction="column"
    {...props}
  >
    {!!props.cardTitle && <Text fontSize="18px" fontWeight="bold" mx="auto" w='fit-content'>{props.cardTitle}</Text>}
    {!!props.subtitle && <Text fontSize="14px" fontWeight="bold" mx="auto" w='fit-content'>{props.subtitle}</Text>}
    {props.children}
  </Flex>
}

const MAX_AREA_CHART_WIDTH = 600;

const Chart = (props) => {
  const { isLoading, data } = props;
  const refElement = useRef();
  const [chartData, setChartData] = useState(null);
  const [refElementWidth, setRefElementWidth] = useState(MAX_AREA_CHART_WIDTH);
  const [oldJson, setOldJson] = useState('');
  const [chartWidth, setChartWidth] = useState<number>(MAX_AREA_CHART_WIDTH);
  const [isLargerThan2xl, isLargerThanLg, isLargerThanXs] = useMediaQuery([
    "(min-width: 96em)",
    "(min-width: 62em)",
    "(min-width: 250px)",
  ]);

  useEffect(() => {
    if (!refElement?.current) return;
    setRefElementWidth(refElement.current.clientWidth);
  }, [refElement?.current])

  useEffect(() => {
    const optimal2ColWidth = ((screen.availWidth || screen.width)) / 2 - 50;
    const optimal1ColWidth = ((screen.availWidth || screen.width)) * 0.94 - 50;
    const w = !isLargerThanXs ? 250 : isLargerThan2xl ? MAX_AREA_CHART_WIDTH : isLargerThanLg ? Math.min(optimal2ColWidth, refElementWidth) : optimal1ColWidth;
    setChartWidth(w);
  }, [isLargerThan2xl, isLargerThanXs, isLargerThanLg, screen?.availWidth]);

  useDebouncedEffect(() => {
    const len = data?.length || 0;
    if (len > 0 && !isLoading && !chartData) {
      const json = len > 3 ? JSON.stringify([data[0], data[len - 2]]) : JSON.stringify(data);
      if (oldJson !== json) {
        setChartData(data);
        setOldJson(json);
      }
    }
  }, [data, isLoading, oldJson, chartData]);

  if (!chartData && isLoading) {
    return <SkeletonBlob mt="10" />
  }
  else if (!chartData) {
    return null;
  }

  // too much flickering when using the responsive container
  return <VStack w='full' ref={refElement}>
    <SDolaStakingEvolutionChart chartWidth={chartWidth} {...props} data={chartData} />
  </VStack>
}

export const SDolaStatsPage = () => {
  const { events, timestamp } = useDolaStakingActivity(undefined, 'sdola');
  const { evolution, timestamp: lastDailySnapTs } = useDolaStakingEvolution();
  const { priceDola: dbrDolaPrice } = useDBRPrice();
  const { sDolaSupply, sDolaTotalAssets, apr, isLoading } = useStakedDola(dbrDolaPrice);
  const [isInited, setInited] = useState(false);
  const [histoData, setHistoData] = useState([]);

  useEffect(() => {
    if (isLoading) return;    
    setHistoData(
      evolution.concat([
        {
          ...evolution[evolution.length - 1],
          timestamp: Date.now() - (1000 * 120),
          apr,
          sDolaTotalAssets,
          sDolaSupply,
        }
      ])
    )
  }, [lastDailySnapTs, evolution, sDolaTotalAssets, apr, isLoading]);

  useEffect(() => {
    setInited(true);
  }, []);

  return (
    <Layout>
      <Head>
        <title>Inverse Finance - sDOLA stats</title>
        <meta name="og:title" content="Inverse Finance - sDOLA stats" />
        <meta name="og:description" content="sDOLA stats" />
        <meta name="description" content="sDOLA stats" />
        <meta name="keywords" content="Inverse Finance, sDOLA, yield-bearing stablecoin, staked DOLA, stats" />
      </Head>
      <AppNav active="sDOLA" activeSubmenu="sDOLA Stats" />
      <DolaStakingTabs defaultIndex={1} />
      <VStack
        w={{ base: 'full', lg: '1200px' }}
        maxW="98vw"
        mt='6'
        spacing="8"
        px={{ base: '4', lg: '0' }}
      >
        <SimpleGrid columns={{ base: 1, xl: 2 }} spacing="8" w="100%">
          <ChartCard subtitle={sDolaTotalAssets > 0 ? `(current: ${preciseCommify(sDolaTotalAssets || 0, 0)})` : ''} cardTitle={`DOLA staked in sDOLA`}>
            {isInited && <Chart isLoading={isLoading} currentValue={sDolaTotalAssets} data={histoData} attribute="sDolaTotalAssets" yLabel="DOLA staked" />}
          </ChartCard>
          <ChartCard cardTitle={`APY evolution`} subtitle={`(current: ${shortenNumber(apr || 0, 2)}%)`}>
            {isInited && <Chart currentValue={apr} isPerc={true} data={histoData} attribute="apr" yLabel="APY" />}
          </ChartCard>
        </SimpleGrid>
        <DolaStakingActivity
          events={events}
          lastUpdate={timestamp}
          title="sDOLA Staking activity"
          headerProps={{
            direction: { base: 'column', md: 'row' },
            align: { base: 'flex-start', md: 'flex-end' },
          }}
          right={
            <HStack justify="space-between" spacing="4">
              <VStack spacing="0" alignItems="center">
                <Text textAlign="center" fontWeight="bold">sDOLA supply</Text>
                {
                  isLoading ? <SmallTextLoader width={'50px'} />
                    : <Text textAlign="center" color="secondaryTextColor" fontWeight="bold" fontSize="18px">
                      {preciseCommify(sDolaSupply, 2)}
                    </Text>
                }
              </VStack>
              <VStack spacing="0" alignItems="center">
                <Text textAlign="center" fontWeight="bold">Total DOLA staked</Text>
                {
                  isLoading ? <SmallTextLoader width={'50px'} />
                    : <Text textAlign="center" color="secondaryTextColor" fontWeight="bold" fontSize="18px">
                      {preciseCommify(sDolaTotalAssets, 2)}
                    </Text>
                }
              </VStack>
            </HStack>
          }
        />
      </VStack>
    </Layout>
  )
}

export default SDolaStatsPage