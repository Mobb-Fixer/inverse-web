import { VStack, Text, HStack, Box, Link } from '@chakra-ui/react'
import { UnderlyingItemBlock } from '@app/components/common/Assets/UnderlyingItemBlock'
import Container from '@app/components/common/Container'
import { getBnToNumber, shortenNumber } from '@app/util/markets'
import { SimpleAmountForm } from '@app/components/common/SimpleAmountForm'
import { F2Market } from '@app/types'
import { JsonRpcSigner } from '@ethersproject/providers'
import { f2borrow, f2repay, getDBRBuyLink } from '@app/util/f2'
import { BigNumber } from 'ethers'
import { useBalances } from '@app/hooks/useBalances'
import { useAccountDBR, useAccountDBRMarket } from '@app/hooks/useDBR'
import { getNetworkConfigConstants } from '@app/util/networks'
import { roundFloorString } from '@app/util/misc'
import { parseEther } from '@ethersproject/units'
import { useEffect, useState } from 'react'
import { InfoMessage } from '@app/components/common/Messages'
import { BigImageButton } from '@app/components/common/Button/BigImageButton'
import theme from '@app/variables/theme'

const { DOLA } = getNetworkConfigConstants();

export const F2BorrowForm = ({
    f2market,
    account,
    signer,
    isBorrowDefault = true,
    onAmountChange,
    switchToSimpleMode,
}: {
    f2market: F2Market
    account: string | null | undefined
    signer: JsonRpcSigner | undefined
    isBorrowDefault?: boolean
    onAmountChange: (v: number) => void
    switchToSimpleMode: () => void
}) => {
    const [isBorrow, setIsBorrow] = useState(isBorrowDefault);
    const [amount, setAmount] = useState(0);
    const colDecimals = f2market.underlying.decimals;

    const { balance: dbrBalance, debt, bnDebt } = useAccountDBR(account);
    const { withdrawalLimit, deposits, debt: marketDebt, bnDolaLiquidity, dolaLiquidity } = useAccountDBRMarket(f2market, account);

    const { balances: dolaBalances } = useBalances([DOLA], 'balanceOf');
    const dolaBalance = dolaBalances ? getBnToNumber(dolaBalances[DOLA]) : 0;
    const bnDolaBalance = dolaBalances ? dolaBalances[DOLA] : BigNumber.from('0');

    const creditLeft = withdrawalLimit * f2market?.price * f2market.collateralFactor;
    const bnMaxNewBorrow = parseEther(roundFloorString(creditLeft || 0));

    const handleAction = (amount: BigNumber) => {
        if (!signer) { return }
        return isBorrow ?
            f2borrow(signer, f2market.address, amount)
            : f2repay(signer, f2market.address, amount)
    }

    const switchMode = () => {
        setIsBorrow(!isBorrow);
    }

    const handleAmountChange = (floatNumber: number) => {
        setAmount(floatNumber)
    }

    useEffect(() => {
        if (!onAmountChange) { return };
        onAmountChange(isBorrow ? amount : -amount);
    }, [isBorrow, amount, onAmountChange]);

    const btnlabel = isBorrow ? 'Borrow' : 'Repay';
    const btnMaxlabel = `${btnlabel} Max`;
    const isVirgin = deposits === 0 && dbrBalance === 0 && debt === 0;

    return <Container
        noPadding
        p="0"
        label={isBorrow ? `Borrow DOLA` : `Repay Borrowed DOLA debt`}
        headerProps={{
            direction: { base: 'column', sm: 'row' },
            align: { base: 'flex-start', sm: 'flex-end' },
        }}
        description={isBorrow ? `Against your deposited collateral` : `This will improve the Collateral Health`}
        contentProps={{
            position: 'relative',
            backgroundColor: `containerContentBackgroundAlpha`,//'lightPrimaryAlpha',
            _after: {
                content: '""',
                position: 'absolute',
                backgroundImage: `url('/assets/f2/${isBorrow ? 'up-arrow' : 'down-arrow'}.svg')`,
                backgroundPosition: '50% 25%',
                backgroundSize: '100px',
                backgroundRepeat: 'no-repeat',
                top: 0, left: 0, right: 0, bottom: 0,
                opacity: 0.5,
                zIndex: -1,
            },
        }}
        image={<BigImageButton bg="url('/assets/dola.png')" h="50px" w="80px" />}
        right={
            (debt > 0 || !isBorrow) && <Text
                mt={{ base: '2', sm: '0' }}
                onClick={() => switchMode()}
                fontSize="14px"
                cursor="pointer"
                textDecoration="underline"
                color="secondaryTextColor"
                w='fit-content'>
                Switch to {isBorrow ? 'Repay' : 'Borrow'}
            </Text>
        }
    >
        <VStack justifyContent='space-between' w='full' minH={'280px'}>
            <VStack alignItems='flex-start' w='full'>
                <HStack w='full' justifyContent="space-between">
                    <Text color="secondaryTextColor">Borrow Asset:</Text>
                    <Text><UnderlyingItemBlock symbol={'DOLA'} /></Text>
                </HStack>
                <HStack w='full' justifyContent="space-between">
                    <Text color="secondaryTextColor">Your DOLA Balance:</Text>
                    <Text>{shortenNumber(dolaBalance, 2)}</Text>
                </HStack>
                {
                    !isVirgin && <>
                        <HStack w='full' justifyContent="space-between">
                            <Text color="secondaryTextColor">Your DOLA Debt:</Text>
                            <Text>{shortenNumber(marketDebt, 2)}</Text>
                        </HStack>
                        <HStack w='full' justifyContent="space-between">
                            <Text color="secondaryTextColor">Your Total DOLA debt:</Text>
                            <Text>{shortenNumber(debt, 2)}</Text>
                        </HStack>
                    </>
                }
                {/* <HStack w='full' justifyContent="space-between">
                    <Text>Your DOLA Borrow Rights:</Text>
                    <Text>{shortenNumber(dbrBalance, 2)}</Text>
                </HStack> */}
                <HStack w='full' justifyContent="space-between">
                    <Text color="secondaryTextColor">Market's DOLA liquidity:</Text>
                    <Text>{shortenNumber(dolaLiquidity, 2)}</Text>
                </HStack>
            </VStack>
            {
                (deposits > 0 && dbrBalance > 0 && (isBorrow || (!isBorrow && debt > 0))) ?
                    <SimpleAmountForm
                        address={isBorrow ? f2market.collateral : DOLA}
                        destination={f2market.address}
                        signer={signer}
                        decimals={colDecimals}
                        maxAmountFrom={isBorrow ? [bnDolaLiquidity, bnMaxNewBorrow] : [bnDolaBalance, bnDebt]}
                        onAction={({ bnAmount }) => handleAction(bnAmount)}
                        onMaxAction={({ bnAmount }) => handleAction(bnAmount)}
                        actionLabel={btnlabel}
                        maxActionLabel={btnMaxlabel}
                        onAmountChange={handleAmountChange}
                        // btnThemeColor={!isBorrow ? 'blue.600' : undefined}
                        showMaxBtn={!isBorrow}
                    />
                    : <VStack>
                        {deposits === 0 &&
                            <InfoMessage
                                alertProps={{ w: 'full' }}
                                title="No Collateral Deposited yet"
                                description={`Loans need to be covered by a collateral, please deposit some.`}
                            />
                        }
                        {!isBorrow && debt === 0 &&
                            <InfoMessage
                                alertProps={{ w: 'full' }}
                                title="Nothing to repay"                                
                            />
                        }
                        {dbrBalance === 0 && debt === 0 &&
                            <InfoMessage
                                alertProps={{ w: 'full' }}
                                title="No DBR tokens"
                                description={
                                    <Box >
                                        <Link textDecoration="underline" href={getDBRBuyLink()} target="_blank" isExternal>
                                            Get DBR tokens
                                        </Link>
                                        <Text display="inline-block">&nbsp;first or use the&nbsp;</Text>
                                        <Text cursor="pointer" textDecoration="underline" display="inline-block" onClick={() => switchToSimpleMode()}>
                                            Simple Mode
                                        </Text>
                                        <Text display="inline-block">&nbsp;to auto-buy them</Text>
                                    </Box>
                                }
                            />
                        }
                    </VStack>
            }
        </VStack>
    </Container>
}