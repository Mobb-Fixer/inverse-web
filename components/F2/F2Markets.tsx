import { Flex, Stack, Text } from "@chakra-ui/react"
import { shortenNumber } from "@app/util/markets";
import Container from "@app/components/common/Container";
import { useAccountDBR, useAccountF2Markets, useDBRMarkets } from '@app/hooks/useDBR';
import { useRouter } from 'next/router';
import { useAccount } from '@app/hooks/misc';
import { getRiskColor } from "@app/util/f2";
import { BigImageButton } from "@app/components/common/Button/BigImageButton";
import Table from "@app/components/common/Table";
import { useFirmTVL } from "@app/hooks/useTVL";

const ColHeader = ({ ...props }) => {
    return <Flex justify="flex-start" minWidth={'150px'} fontSize="14px" fontWeight="extrabold" {...props} />
}

const Cell = ({ ...props }) => {
    return <Stack direction="row" fontSize="14px" fontWeight="normal" justify="flex-start" minWidth="150px" {...props} />
}

const CellText = ({ ...props }) => {
    return <Text fontSize="16px" {...props} />
}

const columns = [
    {
        field: 'name',
        label: 'Market',
        header: ({ ...props }) => <ColHeader minWidth="200px" justify="flex-start"  {...props} />,
        tooltip: 'Market type, each market have an underlying token and strategy',
        value: ({ name, icon, marketIcon }) => {
            return <Cell minWidth="200px" justify="flex-start" alignItems="center" >                
                <BigImageButton bg={`url('${marketIcon || icon}')`} h="25px" w="25px" backgroundSize='contain' backgroundRepeat="no-repeat" />   
                <CellText>{name}</CellText>
            </Cell>
        },
    },
    // {
    //     field: 'supplyApy',
    //     label: 'SUPPLY APY',
    //     header: ({ ...props }) => <ColHeader minWidth="100px" justify="center"  {...props} />,
    //     value: ({ supplyApy }) => {
    //         return <Cell minWidth="100px" justify="center" >
    //             <Text>{supplyApy}%</Text>
    //         </Cell>
    //     },
    // },
    // {
    //     field: 'price',
    //     label: 'price',
    //     header: ({ ...props }) => <ColHeader minWidth="100px" justify="center"  {...props} />,
    //     value: ({ price }) => {
    //         return <Cell minWidth="100px" justify="center" >
    //             <CellText>${commify((price||0)?.toFixed(2))}</CellText>
    //         </Cell>
    //     },
    // },
    {
        field: 'collateralFactor',
        label: 'C.F',
        header: ({ ...props }) => <ColHeader minWidth="90px" justify="center"  {...props} />,
        tooltip: 'Collateral Factor: percentage of the collateral worth transformed into borrowing power',
        value: ({ collateralFactor }) => {
            return <Cell minWidth="90px" justify="center" >
                <CellText>{shortenNumber(collateralFactor * 100, 2)}%</CellText>
            </Cell>
        },
    },
    // {
    //     field: 'dolaLiquidity',
    //     label: 'Liquidity',
    //     header: ({ ...props }) => <ColHeader minWidth="100px" justify="center"  {...props} />,
    //     tooltip: 'Remaining borrowable DOLA liquidity, not taking into account daily limits',
    //     value: ({ dolaLiquidity }) => {
    //         return <Cell minWidth="100px" justify="center" >
    //             <CellText>{shortenNumber(dolaLiquidity, 2, true)}</CellText>
    //         </Cell>
    //     },
    // },
    {
        field: 'leftToBorrow',
        label: "Liquidity",
        header: ({ ...props }) => <ColHeader minWidth="150px" justify="center"  {...props} />,
        tooltip: 'Markets can have daily borrow limits, this shows the remain liquidity left to borrow for the day (UTC timezone)',
        value: ({ leftToBorrow }) => {
            return <Cell minWidth="150px" justify="center" alignItems="center" direction="column" spacing="0" >
                <CellText>{shortenNumber(leftToBorrow, 2, true)}</CellText>
            </Cell>
        },
    },
    {
        field: 'totalDebt',
        label: 'Borrows',
        header: ({ ...props }) => <ColHeader minWidth="150px" justify="center"  {...props} />,
        tooltip: 'Total DOLA borrowed in the Market',
        value: ({ totalDebt }) => {
            return <Cell minWidth="150px" justify="center" >
                <CellText>{shortenNumber(totalDebt, 2, true)}</CellText>
            </Cell>
        },
    },
    {
        field: 'collateralBalance',
        label: 'Wallet',
        header: ({ ...props }) => <ColHeader minWidth="100px" justify="center"  {...props} />,
        tooltip: 'Collateral balance in your wallet',
        value: ({ collateralBalance, price, account }) => {
            return <Cell minWidth="100px" justify="center" alignItems="center" direction={{ base: 'row', sm: 'column' }} spacing={{ base: '1', sm: '0' }}>
                {
                    account ? <>
                        <CellText>{shortenNumber(collateralBalance, 2)}</CellText>
                        <CellText>({shortenNumber(collateralBalance * price, 2, true)})</CellText>
                    </> : <>-</>
                }
            </Cell>
        },
    },
    {
        field: 'debt',
        label: 'Your Deposits',
        header: ({ ...props }) => <ColHeader minWidth="150px" justify="center"  {...props} />,
        tooltip: 'Amount of Collateral you deposited in the Market',
        value: ({ deposits, price, account }) => {
            return <Cell minWidth="150px" justify="center" alignItems="center" direction={{ base: 'row', sm: 'column' }} spacing={{ base: '1', sm: '0' }}>
                {
                    account ? <>
                        <CellText>{shortenNumber(deposits, 2)}</CellText>
                        <CellText>({shortenNumber(deposits * price, 2, true)})</CellText>
                    </> : <>-</>
                }
            </Cell>
        },
    },
    {
        field: 'debt',
        label: 'Your Debt',
        header: ({ ...props }) => <ColHeader minWidth="120px" justify="center"  {...props} />,
        tooltip: 'Amount of DOLA you borrowed from the Market',
        value: ({ debt, account }) => {
            return <Cell minWidth="120px" justify="center" >
                <CellText>{account ? shortenNumber(debt, 2, true) : '-'}</CellText>
            </Cell>
        },
    },
    {
        field: 'perc',
        label: 'Borrow Limit',
        header: ({ ...props }) => <ColHeader minWidth="120px" justify="flex-end"  {...props} />,
        tooltip: 'Borrow Limit, should not reach 100%',
        value: ({ perc, debt }) => {
            const color = getRiskColor(perc);
            return <Cell minWidth="120px" justify="flex-end" >
                <CellText color={debt > 0 ? color : undefined}>{debt > 0 ? `${shortenNumber(100 - perc, 2)}%` : '-'}</CellText>
            </Cell>
        },
    },
]

export const F2Markets = ({

}: {

    }) => {
    const { markets } = useDBRMarkets();
    const account = useAccount();
    const accountMarkets = useAccountF2Markets(markets, account);
    const { debt } = useAccountDBR(account);
    const router = useRouter();
    const { firmTotalTvl } = useFirmTVL();

    const openMarket = (market: any) => {
        router.push(debt > 0 ? `/firm/${market.name}` : `/firm/${market.name}#step1`)
    }

    return <Container
        label="FiRM - BETA"
        description="Learn more"
        href="https://docs.inverse.finance/inverse-finance/firm"
        image={<BigImageButton bg={`url('/assets/firm/firm-transparent.png')`} h="40px" w="100px" />}
        contentProps={{ maxW: { base: '90vw', sm: '100%' }, overflowX: 'auto' }}
        // right={
        //     <Stack spacing="0" alignItems="flex-end">
        //         <Text fontWeight="bold" color="mainTextColor">TVL</Text>
        //         <Text color="secondaryTextColor">{shortenNumber(firmTotalTvl, 2, true)}</Text>
        //     </Stack>
        // }
    >
        <Table
            keyName="address"
            noDataMessage="Loading..."
            columns={columns}
            items={accountMarkets}
            onClick={openMarket}
            defaultSort="address"
            defaultSortDir="desc"
            enableMobileRender={true}
            mobileClickBtnLabel={'View Market'}
            spacing="0"
        />
    </Container>
}