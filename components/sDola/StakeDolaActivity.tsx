import { Text, Flex, Stack } from "@chakra-ui/react"
import { SWR } from "@app/types";
import { useCustomSWR } from "@app/hooks/useCustomSWR";
import { fetcher } from "@app/util/web3";
import Table from "@app/components/common/Table";
import ScannerLink from "@app/components/common/ScannerLink";
import { Timestamp } from "@app/components/common/BlockTimestamp/Timestamp";
import Container from "../common/Container";
import { preciseCommify } from "@app/util/misc";

const ColHeader = ({ ...props }) => {
    return <Flex justify="flex-start" minWidth={'100px'} fontSize="12px" fontWeight="extrabold" {...props} />
}

const Cell = ({ ...props }) => {
    return <Stack direction="row" fontSize="12px" fontWeight="normal" justify="flex-start" minWidth="100px" {...props} />
}

const CellText = ({ ...props }) => {
    return <Text fontSize="12px" {...props} />
}

const columns = [
    {
        field: 'txHash',
        label: 'tx',
        header: ({ ...props }) => <ColHeader minWidth="100px" justify="flex-start"  {...props} />,
        value: ({ txHash }) => {
            return <Cell justify="flex-start" minWidth="100px">
                <ScannerLink value={txHash} type="tx" fontSize='12px' />
            </Cell>
        },
    },
    {
        field: 'timestamp',
        label: 'Date',
        header: ({ ...props }) => <ColHeader justify="flex-start" minWidth={'100px'} {...props} />,
        value: ({ timestamp }) => <Cell justify="flex-start" minWidth="100px">
            <Timestamp timestamp={timestamp} text1Props={{ fontSize: '12px' }} text2Props={{ fontSize: '12px' }} />
        </Cell>,
    },
    {
        field: 'to',
        label: 'Buyer',
        header: ({ ...props }) => <ColHeader justify="flex-start" {...props} minWidth="130px" />,
        value: ({ to }) => {
            return <Cell w="130px" justify="flex-start" position="relative" onClick={(e) => e.stopPropagation()}>
                <ScannerLink value={to} />
            </Cell>
        },
    },
    {
        field: 'amount',
        label: 'Amount',
        header: ({ ...props }) => <ColHeader minWidth="90px" justify="center"  {...props} />,
        value: ({ amount }) => {
            return <Cell minWidth="90px" justify="center" >
                <CellText>{preciseCommify(amount, 2, false, true)} DOLA</CellText>
            </Cell>
        },
    },    
]

export const useStakedDolaActivity = (account?: string): SWR & {
    events: any,
    accountEvents: any,    
    timestamp: number,
} => {
    const { data, error } = useCustomSWR(`/api/transparency/sdola`, fetcher);

    const events = (data?.events || []);

    return {
        events,
        accountEvents: events.filter(e => e.account === account),
        timestamp: data ? data.timestamp : 0,
        isLoading: !error && !data,
        isError: error,
    }
}

export const StakeDolaActivity = ({ events }) => {
    return <Container
        label="My past DOLA staking activity"
        noPadding
        m="0"
        p="0"
    >
        <Table
            keyName="txHash"
            columns={columns}
            items={events}
            noDataMessage="No DBR buys yet"
        />
    </Container>
}