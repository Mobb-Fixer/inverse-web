import { Flex, Stack, Text, Image, VStack, Select } from '@chakra-ui/react'

import Container from '@app/components/common/Container'
import { ErrorBoundary } from '@app/components/common/ErrorBoundary'
import Layout from '@app/components/common/Layout'
import { AppNav } from '@app/components/common/Navbar'
import Head from 'next/head'
import { TransparencyFrontierTabs, TransparencyTabs } from '@app/components/Transparency/TransparencyTabs'
import { useRepayments } from '@app/hooks/useRepayments'
import Table from '@app/components/common/Table'
import { preciseCommify } from '@app/util/misc'
import { UnderlyingItem } from '@app/components/common/Assets/UnderlyingItem'
import { usePrices } from '@app/hooks/usePrices'
import { useEventsAsChartData } from '@app/hooks/misc'
import { DefaultCharts } from '@app/components/Transparency/DefaultCharts'
import { useState } from 'react'

const ColHeader = ({ ...props }) => {
  return <Flex justify="center" minWidth={'150px'} fontSize="14px" fontWeight="extrabold" {...props} />
}

const Cell = ({ ...props }) => {
  return <Stack cursor="default" direction="row" fontSize="14px" fontWeight="normal" justify="center" minWidth="150px" {...props} />
}

const CellText = ({ ...props }) => {
  return <Text fontSize="14px" {...props} />
}

const ClickableCellText = ({ ...props }) => {
  return <CellText
    textDecoration="underline"
    cursor="pointer"
    style={{ 'text-decoration-skip-ink': 'none' }}
    {...props}
  />
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
    label: 'Repaid by the DAO',
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

export const ShortfallsPage = () => {
  const { data } = useRepayments();
  const { prices } = usePrices();
  const [selected, setSelected] = useState('dola');
  const { chartData } = useEventsAsChartData(data[`${selected}RepayedByDAO`] || [], '_acc_', 'amount', false, false);

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

  // const totalBadDebtReducedUsd = items.reduce((prev, curr) => prev + curr.totalBadDebtReduced * curr.priceUsd, 0);

  return (
    <Layout>
      <Head>
        <title>{process.env.NEXT_PUBLIC_TITLE} - Transparency Shortfalls</title>
        <meta name="og:title" content="Inverse Finance - Shortfalls" />
        <meta name="og:description" content="Frontier's shortfalls" />
        <meta name="og:image" content="https://inverse.finance/assets/social-previews/transparency-portal.png" />
        <meta name="description" content="Inverse Finance Shortfalls Details" />
        <meta name="keywords" content="Inverse Finance, transparency, frontier, shortfalls" />
      </Head>
      <AppNav active="Transparency" activeSubmenu="Frontier (deprecated)" hideAnnouncement={true} />
      <TransparencyFrontierTabs active="frontier-shortfalls" />
      <ErrorBoundary>
        <Flex w="full" maxW='6xl' direction="column" justify="center">
          <Stack w='full' alignItems='center' justify="center" direction={{ base: 'column', lg: 'column' }}>
            <Container
              noPadding
              label={
                <Select onChange={(e) => setSelected(e.target.value)}>
                  <option value="dola">DOLA Frontier Repayments by the DAO</option>
                  <option value="eth">ETH Frontier Repayments by the DAO</option>
                  <option value="wbtc">WBTC Frontier Repayments by the DAO</option>
                  <option value="yfi">YFI Frontier Repayments by the DAO</option>
                </Select>
              }
            >
              <DefaultCharts
                barProps={{ eventName: 'Repayment', xDateFormat: 'MMM' }}
                direction={'row'}
                showMonthlyBarChart={true}
                maxChartWidth={550}
                chartData={chartData}
                isDollars={false}
                areaProps={{ showMaxY: false, showTooltips: true }}
              />
            </Container>
            {/* <Container
              noPadding
              collapsable={true}
              defaultCollapse={true}
              label={`WBTC Frontier Repayments`}>
              <DefaultCharts barProps={{ eventName: 'Repayment', xDateFormat: 'MMM' }} direction={'row'} showMonthlyBarChart={true} maxChartWidth={550} chartData={wbtcChart} isDollars={false} areaProps={{ showMaxY: false, showTooltips: true }} />
            </Container>
            <Container
              noPadding
              collapsable={true}
              defaultCollapse={true}
              label={`WBTC Frontier Repayments`}>
              <DefaultCharts barProps={{ eventName: 'Repayment', xDateFormat: 'MMM' }} direction={'row'} showMonthlyBarChart={true} maxChartWidth={550} chartData={ethChart} isDollars={false} areaProps={{ showMaxY: false, showTooltips: true }} />
            </Container>
            <Container
              noPadding
              collapsable={true}
              defaultCollapse={true}
              label={`WBTC Frontier Repayments`}>
              <DefaultCharts barProps={{ eventName: 'Repayment', xDateFormat: 'MMM' }} direction={'row'} showMonthlyBarChart={true} maxChartWidth={550} chartData={yfiChart} isDollars={false} areaProps={{ showMaxY: false, showTooltips: true }} />
            </Container> */}
          </Stack>
          <Container
            noPadding
            label={`Bad Debt Converter and Repayer`}
            description={`Learn more about the bad debt, Debt Converter and Debt Repayer`}
            href={'https://docs.inverse.finance/inverse-finance/inverse-finance/other/frontier'}
          // right={
          //   <VStack spacing="0" alignItems="flex-end">
          //     <Text>
          //       Total Bad debt reduced:
          //     </Text>
          //     <Text color="success" fontSize="22px" fontWeight="extrabold">
          //       {preciseCommify(totalBadDebtReducedUsd, 0, true)}
          //     </Text>
          //   </VStack>
          // }
          >
            <Table
              items={items}
              columns={columns}
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

export default ShortfallsPage
