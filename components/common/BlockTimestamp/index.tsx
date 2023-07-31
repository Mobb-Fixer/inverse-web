import { useBlockTimestamp } from '@app/hooks/useBlockTimestamp';
import { Stack, Text, StackDirection, TextProps } from '@chakra-ui/react';
import moment from 'moment';

const defaultFormat = 'MMM Do YYYY';

export const BlockTimestamp = ({
    blockNumber,
    format = defaultFormat,
    showRelativeTime = true,
    showAbsoluteTime = true,
    direction = 'column',
    textProps,
    timestamp,
    ...props
}: {
    blockNumber: number,
    timestamp?: number,
    format?: string,
    showRelativeTime?: boolean,
    showAbsoluteTime?: boolean,
    textProps?: TextProps,
    direction?: StackDirection,
}) => {
    const { timestamp: _timestamp } = useBlockTimestamp(blockNumber);
    const ts = timestamp || _timestamp;
    const isCol = direction!.indexOf('column') !== -1;

    return <Stack direction={direction} spacing={isCol ? '0' : '1'} {...props}>
        {
            ts > 0 ?
                <TimestampInfo isCol={isCol} timestamp={ts} format={format} textProps={textProps} />
                :
                <>
                    <Text {...textProps}>Fetching...</Text>
                    {!isCol && <Text {...textProps}>For</Text>}
                    <Text {...textProps}>BN {blockNumber}</Text>
                </>
        }
    </Stack>
}

export const TimestampInfo = ({
    timestamp,
    textProps,
    format,
    isCol = true,
}: {
    timestamp: number
    textProps?: TextProps,
    format?: string,
    isCol?: boolean,
}) => {
    return <>
        <Text {...textProps}>{moment(timestamp).fromNow()}</Text>
        {!isCol && <Text {...textProps}>-</Text>}
        <Text {...textProps}>{moment(timestamp).format(format)}</Text>
    </>
}