import { Flex, Stack, Text, VStack, Select, HStack, Switch } from '@chakra-ui/react'

import Container from '@app/components/common/Container'
import { ErrorBoundary } from '@app/components/common/ErrorBoundary'
import Layout from '@app/components/common/Layout'
import { AppNav } from '@app/components/common/Navbar'
import Head from 'next/head'
import { TransparencyTabs } from '@app/components/Transparency/TransparencyTabs'
import { useRepayments } from '@app/hooks/useRepayments'
import Table from '@app/components/common/Table'
import { getMonthDiff, preciseCommify } from '@app/util/misc'
import { UnderlyingItem } from '@app/components/common/Assets/UnderlyingItem'
import { usePrices } from '@app/hooks/usePrices'
import { useEventsAsChartData } from '@app/hooks/misc'
import { DefaultCharts } from '@app/components/Transparency/DefaultCharts'
import { useState } from 'react'
import moment from 'moment'

const ColHeader = ({ ...props }) => {
  return <Flex justify="center" minWidth={'150px'} fontSize="14px" fontWeight="extrabold" {...props} />
}

const Cell = ({ ...props }) => {
  return <Stack cursor="default" direction="row" fontSize="14px" fontWeight="normal" justify="center" minWidth="150px" {...props} />
}

const CellText = ({ ...props }) => {
  return <Text fontSize="14px" {...props} />
}

const columns = [
  {
    field: 'symbol',
    label: 'Asset',
    header: ({ ...props }) => <ColHeader minWidth="150px" justify="flex-start"  {...props} />,
    value: (token) => {
      return <Cell minWidth='150px' spacing="2" justify="flex-start" alignItems="center" direction="row">
        <UnderlyingItem {...token} badge={undefined} label={token.symbol} />
      </Cell>
    },
  },
  {
    field: 'badDebtUsd',
    label: 'Remaining Bad Debt',
    header: ({ ...props }) => <ColHeader minWidth="150px" justify="center"  {...props} />,
    value: ({ badDebtBalance, badDebtUsd, symbol }) => {
      return <Cell minWidth='150px' spacing="2" justify="center" alignItems="center" direction="column">
        <CellText fontWeight="bold" >{preciseCommify(badDebtUsd, 0, true)}</CellText>
        <CellText >{preciseCommify(badDebtBalance, symbol === 'DOLA' ? 0 : 2)} {symbol}</CellText>
      </Cell>
    },
  },
  {
    field: 'sold',
    label: 'Repayer: Debt sold',

    header: ({ ...props }) => <ColHeader minWidth="150px" justify="center" {...props} />,
    value: ({ sold, priceUsd, symbol }) => {
      return <Cell minWidth='150px' spacing="2" justify="center" alignItems="center" direction="column">
        {!!sold && <CellText fontWeight="bold" >{preciseCommify(sold * priceUsd, 0, true)}</CellText>}
        <CellText >{sold ? `${preciseCommify(sold, 2)} ${symbol}` : '-'}</CellText>
      </Cell>
    },
  },
  // {
  //   field: 'soldFor',
  //   label: 'Repayer: Paid by Treasury',

  //   header: ({ ...props }) => <ColHeader  minWidth="150px" justify="center"  {...props} />,
  //   value: ({ soldFor, priceUsd, symbol }) => {
  //     return <Cell  minWidth='150px' spacing="2" justify="center" alignItems="center" direction="column">
  //       {!!soldFor && <CellText fontWeight="bold" >{preciseCommify(soldFor * priceUsd, 0, true)}</CellText>}
  //       <CellText >{soldFor ? `${preciseCommify(soldFor, 2)} ${symbol}` : '-'}</CellText>        
  //     </Cell>
  //   },
  // },
  {
    field: 'converted',
    label: 'Converter: sold for IOUs',

    header: ({ ...props }) => <ColHeader minWidth="150px" justify="center"  {...props} />,
    value: ({ converted, priceUsd, symbol }) => {
      return <Cell minWidth='150px' spacing="2" justify="center" alignItems="center" direction="column">
        {!!converted && <CellText fontWeight="bold">{preciseCommify(converted * priceUsd, 0, true)}</CellText>}
        <CellText >{converted ? `${preciseCommify(converted, 2)} ${symbol}` : '-'}</CellText>
      </Cell>
    },
  },
  // {
  //   field: 'totalBadDebtReduced',
  //   label: 'Total Bad Debt Reduced',
  //   header: ({ ...props }) => <ColHeader minWidth="150px" justify="center"  {...props} />,
  //   value: ({ totalBadDebtReduced, symbol, priceUsd }) => {
  //     return <Cell minWidth='150px' spacing="2" justify="center" alignItems="center" direction="column">
  //       <CellText>{totalBadDebtReduced ? `${preciseCommify(totalBadDebtReduced * priceUsd, 0, true)}` : '-'}</CellText>
  //       <CellText>{totalBadDebtReduced ? `${preciseCommify(totalBadDebtReduced, symbol === 'DOLA' ? 0 : 2)} ${symbol}` : '-'}</CellText>
  //     </Cell>
  //   },
  // },  
  {
    field: 'totalBadDebtRepaidByDao',
    label: 'Repaid',
    header: ({ ...props }) => <ColHeader minWidth="150px" justify="center"  {...props} />,
    value: ({ totalBadDebtRepaidByDao, symbol, priceUsd }) => {
      return <Cell minWidth='150px' spacing="2" justify="center" alignItems="center" direction="column">
        <CellText fontWeight="bold">{totalBadDebtRepaidByDao ? `${preciseCommify(totalBadDebtRepaidByDao * priceUsd, 0, true)}` : '-'}</CellText>
        <CellText>{totalBadDebtRepaidByDao ? `${preciseCommify(totalBadDebtRepaidByDao, symbol === 'DOLA' ? 0 : 2)} ${symbol}` : '-'}</CellText>
      </Cell>
    },
  },
  {
    field: 'repaidViaDwf',
    label: 'Coming from DWF deal',
    header: ({ ...props }) => <ColHeader minWidth="150px" justify="center"  {...props} />,
    value: ({ repaidViaDwf }) => {
      return <Cell minWidth='150px' spacing="2" justify="center" alignItems="center" direction="column">
        <CellText>{repaidViaDwf ? `${preciseCommify(repaidViaDwf, 0)} USDC` : '-'}</CellText>
      </Cell>
    },
  },
];

const keyPrices = {
  'wbtcRepayedByDAO': 'wrapped-bitcoin',
  'ethRepayedByDAO': 'ethereum',
  'yfiRepayedByDAO': 'yearn-finance',
};

// in case api failed to fetch a specific date, we use the closest previous date
const getClosestPreviousHistoPrice = (histoPrices: { [key: string]: number }, date: string, defaultPrice: number) => {
  const dates = Object.keys(histoPrices);
  const closestDate = dates.reduce((prev, curr) => {
    return curr < date ? curr : prev;
  }, date);
  return histoPrices[closestDate] || defaultPrice;
}

const formatToBarData = (data: any, item: any, key: string, isDolaCase: boolean, prices: any, isAllCase = false) => {
  const cgId = isDolaCase ? 'dola-usd' : keyPrices[key];
  const histoData = data ?
    data.histoPrices[cgId]
    : {};
  console.log('histoData', histoData);
  console.log('cgId', cgId);
  console.log('key', key);
  return {
    ...item,
    worth: item.amount * (histoData && histoData[item.date] ?
      histoData[item.date] : isDolaCase ?
        1 : getClosestPreviousHistoPrice(histoData, item.date, prices[cgId]?.usd || 1)
    )
  };
}

const totalRepaymentKeys = ['wbtcRepayedByDAO', 'ethRepayedByDAO', 'yfiRepayedByDAO', 'totalDolaRepayedByDAO', 'dolaForIOUsRepayedByDAO'];

export const BadDebtPage = () => {
  const { data } = useRepayments();
  const [useUsd, setUseUsd] = useState(true);
  const { prices } = usePrices();
  const [selected, setSelected] = useState('all');
  const isAllCase = selected === 'all';
  const isDolaCase = selected.toLowerCase().includes('dola');

  const chartSourceData = isAllCase ?
    totalRepaymentKeys.map(key => {
      return (data[key] || []).map((d, i) => formatToBarData(data, d, key, key.toLowerCase().includes('dola'), prices));
    }).flat() :
    (data[`${selected}RepayedByDAO`] || [])
      .map((d, i) => formatToBarData(data, d, `${selected}RepayedByDAO`, isDolaCase, prices, isAllCase));

  const { chartData: barChartData } = useEventsAsChartData(chartSourceData, '_acc_', useUsd || isAllCase ? 'worth' : 'amount', false, false);
  const { chartData: dolaBadDebtEvo } = useEventsAsChartData(data?.dolaBadDebtEvolution || [], 'badDebt', 'delta', false, false);

  const items = Object.values(data?.badDebts || {}).map(item => {
    const priceUsd = prices[item.coingeckoId]?.usd || 1;
    return {
      ...item,
      badDebtUsd: item.badDebtBalance * priceUsd,
      priceUsd,
      totalBadDebtReduced: item.repaidViaDwf || 0 + item.sold + item.converted,
      totalBadDebtRepaidByDao: data[`${item.symbol.toLowerCase()}RepayedByDAO`]?.reduce((prev, curr) => prev + curr.amount, 0) || 0,
    };
  }).filter(item => item.badDebtBalance > 0.1);

  const totalBadDebtReduced = (data[`${selected}RepayedByDAO`] || []).reduce((prev, curr) => prev + curr.amount, 0) || 0;
  const item = items.find(item => item.symbol.toLowerCase() === selected) || { coingeckoId: 'dola-usd' };
  const totalBadDebtReducedUsd = isDolaCase ? totalBadDebtReduced * prices[item?.coingeckoId]?.usd || 1 :
    chartSourceData.reduce((prev, curr) => prev + curr.worth, 0) || 0;

  const barChartNbMonths = getMonthDiff(new Date('2022-06-01'), new Date());

  return (
    <Layout>
      <Head>
        <title>{process.env.NEXT_PUBLIC_TITLE} - Transparency Bad Debts</title>
        <meta name="og:title" content="Inverse Finance - Bad Debts" />
        <meta name="og:description" content="Bad Debts" />
        <meta name="og:image" content="https://inverse.finance/assets/social-previews/transparency-portal.png" />
        <meta name="description" content="Inverse Finance Bad Debts Details" />
        <meta name="keywords" content="Inverse Finance, transparency, frontier, Bad Debts" />
      </Head>
      <AppNav active="Transparency" activeSubmenu="Bad debts" hideAnnouncement={true} />
      <TransparencyTabs active="bad-debts" />
      <ErrorBoundary>
        <Flex w="full" maxW='6xl' direction="column" justify="center">
          <Stack w='full' alignItems='center' justify="center" direction={{ base: 'column', lg: 'column' }}>
            <Container
              label="DOLA bad debt Evolution"
              description={data?.timestamp ? `Last update: ${moment(data?.timestamp).fromNow()}` : 'Loading...'}
              noPadding
            >
              <DefaultCharts
                barProps={{ eventName: 'Repayment' }}
                // direction={'row'}
                showMonthlyBarChart={false}
                maxChartWidth={1000}
                chartData={dolaBadDebtEvo}
                isDollars={false}
                smoothLineByDefault={false}
                showCustomizationBar={true}
                custombarChildren={
                  <HStack>
                    <Text color="mainTextColorLight" fontSize="14px">To change the zoom level, point an area and use the mouse scroll or change the boundaries in the mini-chart</Text>
                  </HStack>
                }
                areaProps={{ id: 'bad-debt-chart', showMaxY: false, showTooltips: true, autoMinY: true, mainColor: 'info', allowZoom: true }}
              />
            </Container>
            <Container
              noPadding
              label={
                <Stack direction={{ base: 'column', md: 'row' }}>
                  <Select w={{ base: 'auto', sm: '300px' }} onChange={(e) => setSelected(e.target.value)}>
                    <option value="all">Total Repayments in USD</option>
                    <option value="totalDola">Total DOLA Repayments</option>
                    <option value="dolaFrontier">DOLA Frontier Repayments</option>
                    <option value="nonFrontierDola">DOLA Fuse Repayments</option>
                    <option value="dolaForIOUs">IOU Repayments (in DOLA)</option>
                    <option value="eth">ETH Frontier Repayments</option>
                    <option value="wbtc">WBTC Frontier Repayments</option>
                    <option value="yfi">YFI Frontier Repayments</option>
                  </Select>
                  {
                    !isAllCase && <HStack w="100px">
                      <Text fontSize="16px">
                        In USD
                      </Text>
                      <Switch value="true" isChecked={useUsd} onChange={() => setUseUsd(!useUsd)} />
                    </HStack>
                  }
                </Stack>
              }
              headerProps={{
                direction: { base: 'column', md: 'row' },
                align: { base: 'flex-start', md: 'flex-end' },
              }}
              right={
                <Stack pt={{ base: '2', sm: '0' }} justify="center" w='full' spacing="0" alignItems="flex-end" direction={{ base: 'row', sm: 'column' }}>
                  {
                    !isAllCase && <Text>{preciseCommify(totalBadDebtReduced, isDolaCase ? 0 : 2)} {isDolaCase ? 'DOLA' : selected.toUpperCase()}</Text>
                  }
                  <Text fontWeight="bold">
                    {preciseCommify(totalBadDebtReducedUsd, 0, true)} (historical)
                  </Text>
                </Stack>
              }
            >
              <VStack w='full' alignItems="center" justify="center">
                <DefaultCharts
                  barProps={{ eventName: 'Repayment' }}
                  direction={'column-reverse'}
                  showMonthlyBarChart={true}
                  maxChartWidth={1000}
                  chartData={barChartData}
                  isDollars={isAllCase ? true : useUsd}
                  areaProps={{ showMaxY: false, showTooltips: true, id: 'repayments-chart', allowZoom: true }}
                  barProps={{ months: [...Array(barChartNbMonths).keys()] }}
                />
              </VStack>
            </Container>
          </Stack>
          <Container
            noPadding
            label={`Bad Debt Converter and Repayer`}
            description={`Learn more about the bad debt, Debt Converter and Debt Repayer`}
            href={'https://docs.inverse.finance/inverse-finance/inverse-finance/other/frontier'}
            headerProps={{
              direction: { base: 'column', md: 'row' },
              align: { base: 'flex-start', md: 'flex-end' },
            }}
            right={
              <VStack fontSize="14px" spacing="0" alignItems="flex-end">
                <Text>IOUs held: <b>{preciseCommify(data?.iousHeld, 0)}</b></Text>
                <Text>IOUs in DOLA: <b>{preciseCommify(data?.iousDolaAmount, 0)}</b></Text>
              </VStack>
            }
          >
            <Table
              items={items}
              columns={columns}
              enableMobileRender={false}
              key="symbol"
              defaultSort="badDebtUsd"
              defaultSortDir="desc"
            />
          </Container>
        </Flex>
      </ErrorBoundary>
    </Layout>
  )
}

export default BadDebtPage
