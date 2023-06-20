import { Divider, Flex, HStack, SimpleGrid, SkeletonText, Stack, Text, useDisclosure, VStack } from "@chakra-ui/react"
import { shortenNumber } from "@app/util/markets";
import Container from "@app/components/common/Container";
import { useDBRActiveHolders } from "@app/hooks/useFirm";
import Link from "@app/components/common/Link";
import { ViewIcon } from "@chakra-ui/icons";
import ScannerLink from "@app/components/common/ScannerLink";
import moment from 'moment'
import { useState } from "react";
import { MarketImage } from "@app/components/common/Assets/MarketImage";
import { DbrReplenishmentModal } from "./DbrReplenishmentModal";
import Table from "@app/components/common/Table";
import { useDBRPrice } from "@app/hooks/useDBR";
import { biggestSize, smallerSize, slightlyBiggerSize3, slightlyBiggerSize } from '@app/variables/responsive'

const ColHeader = ({ ...props }) => {
    return <Flex justify="flex-start" minWidth={'100px'} fontSize="14px" fontWeight="extrabold" {...props} />
}

const Cell = ({ ...props }) => {
    return <Stack direction="row" fontSize="14px" fontWeight="normal" justify="flex-start" minWidth="100px" {...props} />
}

const CellText = ({ ...props }) => {
    return <Text fontSize="16px" {...props} />
}

const columns = [
    {
        field: 'user',
        label: 'Borrower',
        header: ({ ...props }) => <ColHeader justify="flex-start" {...props} minWidth="100px" />,
        value: ({ user }) => {
            return <Cell w="100px" justify="flex-start" position="relative" onClick={(e) => e.stopPropagation()}>
                <Link isExternal href={`/firm?viewAddress=${user}`}>
                    <ViewIcon color="blue.600" boxSize={3} />
                </Link>
                <ScannerLink value={user} />
            </Cell>
        },
        showFilter: true,
        filterWidth: '100px',
    },
    {
        field: 'signedBalance',
        label: 'DBR Signed Balance',
        header: ({ ...props }) => <ColHeader minWidth="150px" justify="center"  {...props} />,
        value: ({ signedBalance }) => {
            return <Cell minWidth="150px" justify="center" >
                <CellText color={signedBalance < 0 ? 'error' : 'mainTextColor'}>{shortenNumber(signedBalance, signedBalance < 0 ? 4 : 2, false, signedBalance > 0)}</CellText>
            </Cell>
        },
    },
    // {
    //     field: 'balance',
    //     label: 'DBR Balance',
    //     header: ({ ...props }) => <ColHeader minWidth="100px" justify="center"  {...props} />,
    //     value: ({ balance }) => {
    //         return <Cell minWidth="100px" justify="center" >
    //             <CellText>{shortenNumber(balance, 2, false, true)}</CellText>
    //         </Cell>
    //     },
    // },
    {
        field: 'debt',
        label: 'DOLA Debt',
        header: ({ ...props }) => <ColHeader minWidth="100px" justify="center"  {...props} />,
        value: ({ debt }) => {
            return <Cell minWidth="100px" justify="center" >
                <CellText>{shortenNumber(debt, 2)}</CellText>
            </Cell>
        },
    },
    {
        field: 'dailyBurn',
        label: 'DBR Daily Spend',
        header: ({ ...props }) => <ColHeader minWidth="100px" justify="center"  {...props} />,
        value: ({ dailyBurn }) => {
            return <Cell minWidth="100px" justify="center" >
                <CellText>-{shortenNumber(dailyBurn, 2)}</CellText>
            </Cell>
        },
    },
    {
        field: 'dbrExpiryDate',
        label: 'DBR Depletion',
        header: ({ ...props }) => <ColHeader minWidth="120px" justify="center"  {...props} />,
        value: ({ dbrExpiryDate }) => {
            return <Cell spacing="0" alignItems="center" direction="column" minWidth="120px" justify="center">
                <CellText>{moment(dbrExpiryDate).format('MMM Do YYYY')}</CellText>
                <CellText color="secondaryTextColor">{moment(dbrExpiryDate).fromNow()}</CellText>
            </Cell>
        },
    },
    {
        field: 'marketIcons',
        label: 'Collaterals',
        header: ({ ...props }) => <ColHeader minWidth="100px" justify="center"  {...props} />,
        value: ({ marketIcons }) => {
            return <Cell minWidth="100px" justify="center">
                {marketIcons.map(img => <MarketImage key={img} image={img} size={20} />)}
            </Cell>
        },
    },
]

const StatBasic = ({ value, name, isLoading = false }: { value: string, name: string, isLoading?: boolean }) => {
    return <VStack>
        {
            !isLoading ? <Text textAlign="center" color={'secondary'} fontSize={slightlyBiggerSize} fontWeight="extrabold">{value}</Text>
            : <SkeletonText pt="1" skeletonHeight={2} height={'24px'} width={'100px'} noOfLines={1} />
        }
        <Text textAlign="center" color={'mainTextColor'} fontSize={smallerSize} fontWeight="bold">{name}</Text>
    </VStack>
}

export const DbrSpenders = ({

}: {

    }) => {
    const { price } = useDBRPrice();
    const { positions, timestamp, isLoading } = useDBRActiveHolders();
    const { onOpen, onClose, isOpen } = useDisclosure();
    const [position, setPosition] = useState(null);

    const openReplenish = async (data) => {
        setPosition(data);
        onOpen();
    }

    const totalDailyBurn = positions.reduce((prev, curr) => prev + curr.dailyBurn, 0);
    const totalDeficit = positions.reduce((prev, curr) => prev + (curr.deficit), 0);
    const totalDebt = positions.reduce((prev, curr) => prev + curr.debt, 0);
    const monthlyBurn = totalDailyBurn * 30.416;
    const yearlyBurn = totalDailyBurn * 365;

    const fontSize = { base: '12px', sm: '14px' };

    return <VStack w='full' spacing={{ base: '4', sm: '8' }}>
        <SimpleGrid px="4" justify="space-between" w='full' columns={{ base: 3 }} spacing={{ base: '4', sm: '6' }}>
            <StatBasic isLoading={isLoading} name="DBR Daily spend" value={`${shortenNumber(totalDailyBurn, 2)} (${shortenNumber(price * totalDailyBurn, 2, true)})`} />
            <StatBasic isLoading={isLoading} name="DBR Monthly spend" value={`${shortenNumber(monthlyBurn, 2)} (${shortenNumber(price * monthlyBurn, 2, true)})`} />
            <StatBasic isLoading={isLoading} name="DBR Yearly spend" value={`${shortenNumber(yearlyBurn, 2)} (${shortenNumber(price * yearlyBurn, 2, true)})`} />
        </SimpleGrid>
        {/* <Divider /> */}
        <Container
            label="Active DBR Spenders"
            noPadding
            py="4"
            description={timestamp ? `Last update ${moment(timestamp).fromNow()}` : `Loading...`}
            contentProps={{ maxW: { base: '90vw', sm: '100%' }, overflowX: 'auto' }}
            headerProps={{
                direction: { base: 'column', md: 'row' },
                align: { base: 'flex-start', md: 'flex-end' },
            }}
            right={
                <HStack pt="2" alignItems="flex-start" justify="space-between" spacing={{ base: '2', sm: '4' }}>
                    <VStack spacing="0" alignItems={{ base: 'flex-start', sm: 'center' }}>
                        <Text textAlign="left" fontSize={fontSize} fontWeight="bold">Total DBR Deficit</Text>
                        <Text textAlign="left" fontSize={fontSize} color={totalDeficit < 0 ? 'error' : 'secondaryTextColor'}>{totalDeficit ? shortenNumber(totalDeficit, 2) : 'No Deficit'}</Text>
                    </VStack>
                </HStack>
            }
        >
            {
                !!position && position?.marketPositions?.length > 0 && <DbrReplenishmentModal isOpen={isOpen} onClose={onClose} userData={position} />
            }
            <Table
                keyName="user"
                noDataMessage={isLoading ? 'Loading' : "No DBR deficits in last update"}
                columns={columns}
                items={positions}
                onClick={(v) => openReplenish(v)}
                defaultSort={'dbrExpiryDate'}
                defaultSortDir="asc"
            />
        </Container>
    </VStack>
}