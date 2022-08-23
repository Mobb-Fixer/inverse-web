import { shortenNumber } from "@app/util/markets";
import { preciseCommify } from "@app/util/misc";
import { HStack, Text, VStack } from "@chakra-ui/react"
import moment from 'moment';
import { AnimatedInfoTooltip } from "@app/components/common/Tooltip";

const formatValue = (value: number | null, precision = 2, type = 'number', nullPlaceholder = '') => {
    if (value === null) {
        return nullPlaceholder || '';
    }
    switch (type) {
        case 'perc':
            return `${shortenNumber(value, precision, false, true)}%`;
        case 'remainingTime':
            return moment(value).fromNow(true);
        case 'date':
            return moment(value).format('MMM Do, YYYY');
        default:
            return preciseCommify(value, precision, type === 'dollar');
    }
}

export const F2StateInfo = ({
    currentValue,
    nextValue,
    precision = 2,
    placeholder = "",
    prefix = "",
    suffix = "",
    tooltip = '',
    type = 'number',
    nullPlaceholder = '',
    tooltipTitle = '',
}: {
    currentValue: number | null
    nextValue?: number | null
    precision?: number
    placeholder?: any
    prefix?: any
    suffix?: any
    tooltip?: any
    type?: 'number' | 'remainingTime' | 'dollar' | 'perc' | 'date'
    nullPlaceholder?: string
    tooltipTitle?: string
}) => {
    const currentFormatted = formatValue(currentValue, precision, type);
    const nextFormatted = nextValue !== undefined ? formatValue(nextValue, precision, type, nullPlaceholder ?? placeholder) : '';

    const content = !currentValue && !nextValue ?
        placeholder :
        <>{prefix}{currentFormatted}{!!nextFormatted && <b> => {nextFormatted}</b>}{suffix}</>

    const text = <Text cursor="default" color="secondaryTextColor" _hover={{ color: 'mainTextColor' }} transition="color 0.4s">
        {content}
    </Text>

    const hasPreview = !!currentFormatted && !!nextFormatted;

    if (tooltip || hasPreview) {
        const title = tooltipTitle || prefix || suffix;
        return <AnimatedInfoTooltip
            message={
                <VStack alignItems="flex-start" maxW="99vw" w='230px'>
                    {!!title && <Text fontSize="18px" fontWeight="extrabold">{title.replace(':', '')}:</Text>}
                    {!!tooltip && <Text textAlign="left">{tooltip}</Text>}
                    {
                        hasPreview && <VStack w='full' spacing="0" alignItems="flex-start">
                            <HStack w='full' justifyContent="space-between">
                                <Text>Current:</Text>
                                <Text>{currentFormatted}</Text>
                            </HStack>
                            <HStack w='full' justifyContent="space-between">
                                <Text>New:</Text>
                                <Text>{nextFormatted}</Text>
                            </HStack>
                        </VStack>
                    }
                </VStack>
            }
        >
            {text}
        </AnimatedInfoTooltip>
    }

    return text
}