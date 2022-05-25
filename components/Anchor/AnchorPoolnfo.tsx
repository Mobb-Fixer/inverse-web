import { AnimatedInfoTooltip, InfoTooltip } from '@app/components/common/Tooltip';
import { Image, Text, TextProps } from '@chakra-ui/react';
import { shortenNumber } from '@app/util/markets';
import { capitalize } from '@app/util/misc';
import { usePrices } from '@app/hooks/usePrices';
import { RTOKEN_CG_ID } from '@app/variables/tokens';

const BalanceTooltipContent = ({ value, priceUsd }: { value: number, priceUsd: number }) => {
    return <>
        <Text fontWeight="bold">~ {shortenNumber(value, 4, false, true)} ({shortenNumber(value * priceUsd, 2, true, true)})</Text>
    </>
}

const ApyTooltipContent = ({
    monthlyType,
    monthlyValue,
    priceUsd,
    isSupplied,
    symbol,
    emoji,
}: {
    monthlyType: string,
    monthlyValue: number,
    priceUsd: number,
    isSupplied: boolean,
    symbol: string,
    emoji: string,
}) => {
    return <>
        <Text>Monthly {capitalize(monthlyType)}{emoji}</Text>
        ~ <b>{shortenNumber(monthlyValue, 5, false, true)} {symbol}</b> ({shortenNumber(monthlyValue * priceUsd!, 2, true, true)})
        {
            !isSupplied ?
                <Text>This increases the debt to repay</Text> : null
        }
    </>
}

export const AnchorPoolInfo = ({
    value,
    monthlyValue,
    symbol,
    type,
    priceUsd,
    isReward = false,
    isBalance = false,
    underlyingSymbol = '',
    textProps,
    protocolImage,
}: {
    type: 'supply' | 'borrow',
    symbol: string,
    value?: number,
    monthlyValue?: number,
    priceUsd?: number,
    isReward?: boolean,
    isBalance?: boolean,
    underlyingSymbol?: string,
    textProps?: TextProps,
    protocolImage?: string,
}) => {
    const { prices } = usePrices()
    const invPriceUsd = prices[RTOKEN_CG_ID]?.usd || 0;
    const needTooltip = (!!monthlyValue && monthlyValue > 0) || (isBalance && !!value && value > 0);
    const isSupplied = type === 'supply' && needTooltip;
    const emoji = isSupplied ? ' ✨' : '';
    const monthlyType = isSupplied ? 'rewards' : 'interests';
    // invPriceUsd (ref is coingecko) when INV is the asset supplied or it's a reward in INV
    const rtokenSymbol = process.env.NEXT_PUBLIC_REWARD_TOKEN_SYMBOL
    const bestPriceRef = invPriceUsd && (isReward || symbol === rtokenSymbol || underlyingSymbol === rtokenSymbol) ? invPriceUsd : priceUsd;

    const suffix = isBalance ? '' : '%'
    const label = (value ? `${isBalance ? shortenNumber(value, 2, false, true) : value.toFixed(2)}` : '0.00') + suffix

    return (
        <Text {...textProps} opacity={value && value > 0 ? 1 : 0.5} position="relative">
            {label}
            {
                !!protocolImage
                && <AnimatedInfoTooltip message="Yield Bearing Asset Apy">
                    <Image position="absolute" bottom="0" right="-12px" src={protocolImage} width="10px" />
                </AnimatedInfoTooltip>
            }
            {
                needTooltip && bestPriceRef ?
                    <InfoTooltip
                        iconProps={{ ml: '1', fontSize: '10px' }}
                        tooltipProps={{
                            className: `blurred-container ${isSupplied ? 'success-bg' : 'warning-bg'}`,
                            borderColor: isSupplied ? 'success' : 'warning',
                        }}
                        message={
                            isBalance ?
                                <BalanceTooltipContent
                                    priceUsd={bestPriceRef}
                                    value={value!}
                                />
                                :
                                <ApyTooltipContent
                                    isSupplied={isSupplied}
                                    monthlyType={monthlyType}
                                    symbol={symbol}
                                    monthlyValue={monthlyValue!}
                                    priceUsd={bestPriceRef}
                                    emoji={emoji} />
                        } />
                    : null
            }
        </Text>
    )
}