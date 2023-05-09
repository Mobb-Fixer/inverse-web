import { InfoTooltip } from "@app/components/common/Tooltip"
import { capitalize } from "@app/util/misc"
import { Stack, Image, Text, VStack } from "@chakra-ui/react"

export const OracleTypeTooltipContent = ({ subText }: { subText?: string }) => {
    return <VStack w='full' alignItems="flex-start">
        <Text textAlign="left">On-chain source for the collateral price.</Text>
        <Text textAlign="left">PPO is the <b>Pessimistic Price Oracle</b>, it uses the two-day low price of the source oracle.</Text>
        {
            subText === 'index' && <Text textAlign="left">
                Combines the gOHM index and the OHM/ETH & ETH/USD Chainlink feeds.
            </Text>
        }
    </VStack>
}

export const OracleType = ({
    oracleType,
    showImage = true,
    showText = true,
    showTooltip = false,
    subText = '',
}: {
    oracleType: string,
    showImage?: boolean,
    showText?: boolean,
    subText?: string
    showTooltip?: boolean
}) => {//
    return <Stack justify="flex-start" alignItems={{ base: 'flex-end', xl: 'center' }} direction="column" spacing="0">
<Stack alignItems="center" spacing="1" direction="row">
            {
                showTooltip && <InfoTooltip
                    iconProps={{ boxSize: 3 }}
                    tooltipProps={{
                        className: 'blurred-container info-bg',
                        borderColor: 'info',
                        color: 'mainTextColor',
                    }}
                    message={<OracleTypeTooltipContent subText={subText} />}
                />
            }
            {showImage && <Image src={`/assets/oracles/${oracleType}.webp`} h="15px" w="15px" ignoreFallback={true} />}
            {showText && <Text>{capitalize(oracleType)}+PPO</Text>}
        </Stack>
        {!!subText && <Text>+{capitalize(subText)}</Text>}
    </Stack>
}