import { Stack, VStack, Text, HStack, FlexProps, Divider, Switch, FormControl, FormLabel, useMediaQuery, useDisclosure } from '@chakra-ui/react'
import Container from '@app/components/common/Container'
import { getNumberToBn } from '@app/util/markets'
import { parseEther, parseUnits } from '@ethersproject/units'
import { SimpleAmountForm } from '@app/components/common/SimpleAmountForm'
import { f2repayAndWithdrawNative, f2borrow, f2deposit, f2depositAndBorrow, f2depositAndBorrowHelper, f2repay, f2repayAndWithdraw, f2sellAndRepayHelper, f2sellAndWithdrawHelper, f2withdraw, f2withdrawMax } from '@app/util/f2'

import { useContext, useEffect } from 'react'

import { MarketImage } from '@app/components/common/Assets/MarketImage'
import { TOKENS } from '@app/variables/tokens'
import { getNetworkConfigConstants } from '@app/util/networks'
import { F2FormInfos } from './F2FormInfos'
import { NavButtons } from '@app/components/common/Button'
import { F2MarketContext } from '../F2Contex'
import WethModal from '@app/components/common/Modal/WethModal'
import { DBRAutoRepayCalculator } from '../DBRAutoRepayCalculator'

import { FirmLeverageModal } from '../Modals/FirmLeverageModal'
import { FEATURE_FLAGS } from '@app/config/features'
import { FirmBoostInfos, getLeverageImpact } from '../ale/FirmBoostInfos'
import { prepareDeleveragePosition, prepareLeveragePosition } from '@app/util/firm-ale'
import { removeTrailingZeros } from '@app/util/misc'
import { showToast } from '@app/util/notify'
import { BorrowPausedMessage, CannotWithdrawIfDbrDeficitMessage, MinDebtBorrowMessage, NoDbrInWalletMessage, NoDolaLiqMessage, NotEnoughCollateralMessage, NotEnoughLiqWithAutobuyMessage, ResultingBorrowLimitTooHighMessage } from './FirmFormSubcomponents/FirmMessages'
import { AutoBuyDbrDurationInputs, DbrHelperSwitch, SellDbrInput } from './FirmFormSubcomponents/FirmDbrHelper'
import { FirmBorroInputwSubline, FirmCollateralInputTitle, FirmDebtInputTitle, FirmExitModeSwitch, FirmLeverageSwitch, FirmRepayInputSubline, FirmWethSwitch, FirmWithdrawInputSubline } from './FirmFormSubcomponents'

const { DOLA, F2_HELPER, F2_ALE } = getNetworkConfigConstants();

const dolaToken = TOKENS[DOLA];

const MODES = {
    'Deposit & Borrow': 'd&b',
    'Deposit': 'deposit',
    'Borrow': 'borrow',
    'Repay & Withdraw': 'r&w',
    'Repay': 'repay',
    'Withdraw': 'withdraw',
}

const inOptions = ['Deposit & Borrow', 'Deposit', 'Borrow'];
const outOptions = ['Repay & Withdraw', 'Withdraw', 'Repay'];

let timeout = -1;

export const F2CombinedForm = ({
    ...props
}: {
} & Partial<FlexProps>) => {
    const {
        colDecimals,
        market,
        handleDurationChange,
        handleDebtChange,
        handleCollateralChange,
        duration,
        durationType,
        durationTypedValue,
        collateralAmount,
        debtAmount,
        collateralAmountNum,
        debtAmountNum,
        deltaDebt,
        isDeposit,
        setIsDeposit,
        isAutoDBR,
        setIsAutoDBR,
        isUseNativeCoin,
        setIsUseNativeCoin,
        dbrPrice,
        signer,
        dbrCoverDebt,
        dbrBalance,
        bnDbrBalance,
        mode,
        setMode,
        dolaBalance,
        bnDolaBalance,
        isWethMarket,
        dbrSellAmount,
        setDbrSellAmount,
        aleSlippage,
        dbrBuySlippage,
        setDbrBuySlippage,
        deposits, bnDeposits, debt, bnWithdrawalLimit, bnLeftToBorrow, bnCollateralBalance, collateralBalance, bnDebt,
        newPerc, newCreditLimit,
        notFirstTime, onFirstTimeModalOpen,
        firmActionIndex, setFirmActionIndex, setCachedFirmActionIndex,
        newTotalDebtInMarket,
        setUseLeverage,
        useLeverage,
        useLeverageInMode,
        leverage,
        setLeverage,
        setLeverageCollateralAmount,
        leverageCollateralAmount,
        leverageCollateralAmountNum,
        setLeverageDebtAmount,
        leverageDebtAmount,
        leverageDebtAmountNum,
        dolaPrice,
        newTotalDebt,
        newDeposits,
        userNotEligibleForLeverage,
        setLeverageLoading,
        leverageLoading,
        setLeveragePriceImpact,
    } = useContext(F2MarketContext);

    const [isLargerThan] = useMediaQuery('(min-width: 1280px)');
    const { isOpen: isWethSwapModalOpen, onOpen: onWethSwapModalOpen, onClose: onWethSwapModalClose } = useDisclosure();

    const hasCollateralChange = ['deposit', 'd&b', 'withdraw', 'r&w'].includes(MODES[mode]);
    const hasDebtChange = ['borrow', 'd&b', 'repay', 'r&w'].includes(MODES[mode]);
    const isDepositCase = ['deposit', 'd&b'].includes(MODES[mode]);
    const isBorrowCase = ['borrow', 'd&b'].includes(MODES[mode]);
    const isWithdrawCase = ['r&w', 'withdraw'].includes(MODES[mode]);
    const isRepayCase = ['repay', 'r&w'].includes(MODES[mode]);
    const isBorrowOnlyCase = 'borrow' === MODES[mode];
    const isWithdrawOnlyCase = 'withdraw' === MODES[mode];
    const isSigNeeded = useLeverageInMode || ((isBorrowCase || isWithdrawCase) && isAutoDBR) || ((isDepositCase || isWithdrawCase) && isUseNativeCoin);

    const handleWithdrawMax = () => {
        if (!signer) { return }
        return f2withdrawMax(signer, market.address);
    }

    const handleAction = async () => {
        if (!signer) { return }
        if (!notFirstTime && isBorrowCase) {
            const firstTimeAction = await onFirstTimeModalOpen();
            if (firstTimeAction !== 'continue') {
                return
            }
        }
        const action = MODES[mode]

        const minDolaOut = !isAutoDBR ? parseUnits('0') : getNumberToBn((parseFloat(dbrSellAmount || '0') * (dbrPrice * (1 - parseFloat(dbrBuySlippage) / 100))));
        const dbrAmountToSell = !isAutoDBR ? parseUnits('0') : parseUnits(dbrSellAmount || '0');

        if (action === 'deposit') {
            return f2deposit(signer, market.address, parseUnits(collateralAmount, market.underlying.decimals), isUseNativeCoin);
        } else if (action === 'borrow') {
            if (isAutoDBR) {
                return f2depositAndBorrowHelper(
                    signer,
                    market.address,
                    parseUnits('0', market.underlying.decimals),
                    parseUnits(debtAmount),
                    dbrBuySlippage,
                    duration,
                    false,
                    true,
                );
            }
            return f2borrow(signer, market.address, parseUnits(debtAmount));
        } else if (action === 'withdraw') {
            return f2withdraw(signer, market.address, parseUnits(collateralAmount, market.underlying.decimals), isUseNativeCoin);
        } else if (action === 'repay') {
            if (isAutoDBR) {
                return f2sellAndRepayHelper(signer, market.address, parseUnits(debtAmount), minDolaOut, dbrAmountToSell);
            }
            return f2repay(signer, market.address, parseUnits(debtAmount));
        } else if (action === 'd&b') {
            if (useLeverageInMode) {
                return prepareLeveragePosition(
                    signer,
                    market,
                    parseUnits(debtAmount),
                    // deposit in addition to collateral increase due to leverage
                    parseUnits(collateralAmount || '0', market.underlying.decimals),
                    aleSlippage,
                    isAutoDBR ? dbrBuySlippage : undefined,
                    isAutoDBR ? duration : 0,
                );
            }
            else if (isAutoDBR || isUseNativeCoin) {
                return f2depositAndBorrowHelper(
                    signer,
                    market.address,
                    parseUnits(collateralAmount, market.underlying.decimals),
                    parseUnits(debtAmount),
                    dbrBuySlippage,
                    isAutoDBR ? duration : 0,
                    isUseNativeCoin,
                );
            }
            return f2depositAndBorrow(signer, market.address, parseUnits(collateralAmount, market.underlying.decimals), parseUnits(debtAmount));
        } else if (action === 'r&w') {
            if (useLeverageInMode) {
                return prepareDeleveragePosition(
                    signer,
                    market,
                    parseUnits(debtAmount || '0'),
                    // withdrawn by deleverage
                    parseUnits(collateralAmount || '0', market.underlying.decimals),
                    aleSlippage,
                    dbrAmountToSell,
                    minDolaOut,
                );
            }
            else if (isAutoDBR || isUseNativeCoin) {
                if (!isAutoDBR) {
                    return f2repayAndWithdrawNative(signer, market.address, parseUnits(debtAmount), parseUnits(collateralAmount, market.underlying.decimals));
                }
                return f2sellAndWithdrawHelper(signer, market.address, parseUnits(debtAmount), parseUnits(collateralAmount, market.underlying.decimals), minDolaOut, dbrAmountToSell, isUseNativeCoin);
            }
            return f2repayAndWithdraw(signer, market.address, parseUnits(debtAmount), parseUnits(collateralAmount, market.underlying.decimals));
        } else {
            alert('AlphaPhase: Contract is not implemented yet for this action');
        }
    }

    const retriggerLeverage = (isDeposit: boolean, inputString?: string, num?: number, leverageInMode?: boolean) => {
        if (!isDeposit) {
            triggerCollateralAndOrLeverageChange(leverageCollateralAmount, leverageCollateralAmountNum);
        } else {
            triggerDebtAndOrLeverageChange(inputString || leverageDebtAmount, num || leverageDebtAmountNum, leverageInMode);
        }
    }

    const handleDirectionChange = () => {
        const _isDeposit = !isDeposit;
        setIsDeposit(_isDeposit);
        setMode(_isDeposit ? inOptions[outOptions.indexOf(mode)] : outOptions[inOptions.indexOf(mode)]);
        if(useLeverage){
            resetForm(true);
        }
    }

    const onSuccess = () => {
        resetForm();
        const newFirmActionIndex = firmActionIndex + 1;
        setCachedFirmActionIndex(newFirmActionIndex)
        setFirmActionIndex(newFirmActionIndex);
    }

    const resetForm = (disableLeverage = true) => {
        handleDebtChange('');
        handleCollateralChange('');
        setDbrSellAmount('');
        setUseLeverage(!disableLeverage);
        resetLeverage();
    }

    const resetLeverage = () => {
        setLeverageCollateralAmount('');
        setLeverageDebtAmount('');
        setLeverage(1);
    }

    const triggerCollateralAndOrLeverageChange = async (collateralString: string, collateralNum: number) => {
        handleCollateralChange(collateralString);
        const debouncedZeroXCall = async () => {
            if (useLeverageInMode && isDeleverageCase) {
                const desiredWorth = (deposits - collateralNum) * market.price;
                const leverage = (deposits * market.price) / desiredWorth;
                setLeverage(leverage);
                if (!market.price || leverage <= 1) {
                    resetLeverage();
                    return
                }
                const { dolaAmount, errorMsg } = await getLeverageImpact({
                    deposits, debt, leverageLevel: leverage, market, isUp: false, dolaPrice, setLeverageLoading, viaInput: true, setLeveragePriceImpact
                });
                if (!!errorMsg) {
                    showToast({ status: 'warning', description: errorMsg, title: 'ZeroX api error' })
                    return
                }
                setLeverageDebtAmount(Math.abs(dolaAmount).toFixed(2));
                // setLeverageCollateralAmount('');
            }
        }        
        if(timeout !== -1){
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            debouncedZeroXCall();
        }, 300);
    }

    const triggerDebtAndOrLeverageChange = async (debtString: string, debtNum: number, leverageInMode?: boolean, viaInput?: boolean) => {
        handleDebtChange(debtString);
        
        const debouncedZeroXCall = async () => {     
            if (leverageInMode || useLeverageInMode && !isDeleverageCase && !!debtNum && debtNum > 0) {                
                const baseColAmountForLeverage = deposits > 0 ? deposits : collateralAmountNum;
                const baseWorth = baseColAmountForLeverage * market.price;
                const leverage = (debtNum + baseWorth) / baseWorth;
                if (!market.price || leverage <= 1) {
                    resetLeverage();
                    return
                }
                const { collateralAmount, errorMsg } = await getLeverageImpact({
                    deposits, debt, leverageLevel: leverage, market, isUp: true, dolaPrice, setLeverageLoading, viaInput, dolaInput: viaInput ? debtString : undefined, setLeveragePriceImpact
                });
                if (!!errorMsg) {
                    showToast({ status: 'warning', description: errorMsg, title: 'ZeroX api error' })
                    return
                }
                setLeverageCollateralAmount(removeTrailingZeros(collateralAmount.toFixed(8)));
                setLeverage(leverage);
            } else if ((!debtString || debtString === '0') && !isDeleverageCase) {
                resetLeverage();
            }
        }
        if(timeout !== -1){
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            debouncedZeroXCall();
        }, 300);
    }

    const btnLabel = isDeposit ? `Deposit & Borrow` : 'Withdraw';
    const btnMaxlabel = `${btnLabel} Max`;
    const notEnoughToBorrowWithAutobuy = isBorrowCase && market.leftToBorrow > 1 && deltaDebt > 0 && market.leftToBorrow < (isAutoDBR ? deltaDebt + (dbrCoverDebt * (1 + parseFloat(dbrBuySlippage || 0) / 100)) : deltaDebt);
    const minDebtDisabledCondition = FEATURE_FLAGS.firmMinDebt && newTotalDebtInMarket > 0 && newTotalDebtInMarket < market.minDebt;
    const isDeleverageCase = useLeverageInMode && !isDeposit;
    // disallow INV for now as 0x routing is too bad atm
    const canUseLeverage = !market.isInv && FEATURE_FLAGS.firmLeverage && market.hasAleFeat && !isUseNativeCoin && ((mode === 'Deposit & Borrow' && (deposits > 0 || collateralAmountNum > 0)) || (mode === 'Repay & Withdraw' && debt > 1));
    const showMinDebtMessage = !notEnoughToBorrowWithAutobuy && minDebtDisabledCondition && (debtAmountNum > 0 || isDeleverageCase);
    const showNeedDbrMessage = isDeposit && !isAutoDBR && dbrBalance <= 0;

    const disabledConditions = {
        'deposit': ((collateralAmountNum <= 0 && !useLeverageInMode) || collateralBalance < collateralAmountNum),
        'borrow': duration <= 0 || debtAmountNum <= 0 || newPerc < 1 || showNeedDbrMessage || market.leftToBorrow < 1 || debtAmountNum > market.leftToBorrow || notEnoughToBorrowWithAutobuy || minDebtDisabledCondition,
        'repay': (debtAmountNum <= 0 && !useLeverageInMode) || debtAmountNum > debt || (debtAmountNum > dolaBalance && !useLeverageInMode) || (isAutoDBR && !parseFloat(dbrSellAmount)),
        'withdraw': ((collateralAmountNum <= 0 && !useLeverageInMode) || collateralAmountNum > deposits || newPerc < 1 || dbrBalance < 0),
    }
    const disabledDueToLeverage = useLeverageInMode && (leverage <= 1 || leverageLoading);
    disabledConditions['d&b'] = disabledConditions['deposit'] || disabledConditions['borrow'] || !parseFloat(dbrBuySlippage) || disabledDueToLeverage;
    disabledConditions['r&w'] = disabledConditions['repay'] || disabledConditions['withdraw'] || disabledDueToLeverage;

    const showResultingLimitTooHigh = disabledConditions[MODES[mode]] && (!!debtAmountNum || !!collateralAmountNum) && newPerc < 1;
    const modeLabel = market.isInv ? mode.replace(/deposit/i, 'Stake').replace(/withdraw/i, 'Unstake') : mode;
    const actionBtnLabel = useLeverageInMode ? `Sign + ${collateralAmountNum > 0 && !isDeleverageCase ? 'Deposit & ' : ''}Leverage ${isDeposit ? 'up' : 'down'}` : isSigNeeded ? `Sign + ${modeLabel}` : modeLabel;

    const mainFormInputs = <Stack direction={{ base: 'column' }} spacing="4" w='full'>
        {
            hasCollateralChange && <VStack w='full' alignItems="flex-start">
                <FirmCollateralInputTitle isDeposit={isDeposit} market={market} deposits={deposits} isWethMarket={isWethMarket} isUseNativeCoin={isUseNativeCoin} useLeverageInMode={useLeverageInMode} />
                {
                    deposits > 0 || isDeposit ? <>
                        <SimpleAmountForm
                            defaultAmount={collateralAmount}
                            address={isUseNativeCoin ? '' : market.collateral}
                            destination={isAutoDBR ? F2_HELPER : market.address}
                            signer={signer}
                            decimals={colDecimals}
                            maxAmountFrom={isDeposit ? isUseNativeCoin ? undefined : [bnCollateralBalance] : [bnDeposits].concat(isWithdrawOnlyCase ? [bnWithdrawalLimit] : [])}
                            onAction={handleAction}
                            onMaxAction={handleAction}
                            actionLabel={btnLabel}
                            maxActionLabel={btnMaxlabel}
                            onAmountChange={(v, s) => {
                                triggerCollateralAndOrLeverageChange(v, s);
                            }}
                            showMaxBtn={isDeposit || !debt}
                            hideInputIfNoAllowance={false}
                            hideButtons={true}
                            showMax={!isDeleverageCase}
                            showBalance={isDeposit}
                            inputProps={isDeleverageCase ? { disabled: false } : undefined}
                            inputRight={<MarketImage pr="2" image={isWethMarket ? (isUseNativeCoin ? market.icon : market.underlying.image) : market.icon || market.underlying.image} size={25} />}
                            isError={isDeposit ? collateralAmountNum > collateralBalance : collateralAmountNum > deposits}
                        />
                        {
                            isWethMarket && !!market.helper && !isDeleverageCase
                            && <FirmWethSwitch
                                useLeverage={useLeverage}
                                onWethSwapModalOpen={onWethSwapModalOpen}
                                setIsUseNativeCoin={setIsUseNativeCoin}
                                isUseNativeCoin={isUseNativeCoin}
                            />
                        }
                        {/* <AmountInfos label="Total Deposits" value={deposits} price={market.price} delta={deltaCollateral} textProps={{ fontSize: '14px' }} /> */}
                    </>
                        : <Text>Nothing to withdraw</Text>
                }
                {
                    dbrBalance < 0 && !isDeposit && <CannotWithdrawIfDbrDeficitMessage />
                }
                {
                    !isDeposit && deposits > 0 && !isDeleverageCase && <FirmWithdrawInputSubline
                        deposits={deposits}
                        price={market.price}
                        handleCollateralChange={handleCollateralChange}
                        bnDeposits={bnDeposits}
                        decimals={market.underlying.decimals}
                    />
                }
            </VStack>
        }
        {['d&b', 'r&w'].includes(MODES[mode]) && <Divider borderColor="#cccccc66" />}
        <FirmLeverageModal />
        {
            hasDebtChange && <VStack w='full' alignItems="flex-start">
                <FirmDebtInputTitle isDeposit={isDeposit} useLeverageInMode={useLeverageInMode} />
                {
                    (debt > 0 || isDeposit) && ((deposits > 0 && isBorrowOnlyCase) || !isBorrowOnlyCase) ?
                        <>
                            <SimpleAmountForm
                                defaultAmount={isDeleverageCase ? '' : debtAmount}
                                address={market.collateral}
                                destination={isAutoDBR ? F2_HELPER : market.address}
                                signer={signer}
                                decimals={18}
                                maxAmountFrom={isDeposit ? [bnLeftToBorrow, parseEther((newCreditLimit * 0.99).toFixed(0))] : [bnDebt, bnDolaBalance]}
                                onAction={({ bnAmount }) => handleAction()}
                                onMaxAction={({ bnAmount }) => handleAction()}
                                actionLabel={btnLabel}
                                maxActionLabel={btnMaxlabel}
                                onAmountChange={(v, s) => {
                                    triggerDebtAndOrLeverageChange(v, s, undefined, true);
                                }}
                                showMax={!isDeleverageCase && !isDeposit}
                                showMaxBtn={!isDeposit}
                                hideInputIfNoAllowance={false}
                                hideButtons={true}
                                inputRight={<MarketImage pr="2" image={dolaToken.image} size={25} />}
                                isError={isDeposit ? debtAmountNum > 0 && newPerc < 1 : debtAmountNum > debt}
                            // inputProps={isDeleverageCase ? { disabled: true, placeholder: `Repay via deleverage: ~${debtAmount}` } : undefined}
                            />
                            {
                                isRepayCase ? <FirmRepayInputSubline
                                    isDeleverageCase={isDeleverageCase}
                                    dolaBalance={dolaBalance}
                                    debt={debt}
                                    handleDebtChange={handleDebtChange}
                                    bnDolaBalance={bnDolaBalance}
                                    bnDebt={bnDebt}
                                />
                                    :
                                    <FirmBorroInputwSubline leftToBorrow={market.leftToBorrow} bnLeftToBorrow={bnLeftToBorrow} handleDebtChange={handleDebtChange} />
                            }
                        </>
                        : isBorrowOnlyCase ? <Text>Please deposit collateral first</Text> : <Text>Nothing to repay</Text>
                }
                {notEnoughToBorrowWithAutobuy && <NotEnoughLiqWithAutobuyMessage leftToBorrow={market.leftToBorrow} isAutoDBR={isAutoDBR} dbrCoverDebt={dbrCoverDebt} deltaDebt={deltaDebt} />}
                {showMinDebtMessage && <MinDebtBorrowMessage debt={debt} minDebt={market.minDebt} />}
                {showNeedDbrMessage && <NoDbrInWalletMessage />}
                <HStack justify="space-between" alignItems="space-between" w='full'>
                    {
                        (hasDebtChange || hasCollateralChange) && <DbrHelperSwitch
                            isDeposit={isDeposit}
                            setIsAutoDBR={setIsAutoDBR}
                            isAutoDBR={isAutoDBR}
                            hasHelper={!!market.helper}
                        />
                    }
                    {
                        canUseLeverage && <FirmLeverageSwitch isDeposit={isDeposit} useLeverage={useLeverage} onChange={(isDeposit) => {
                            const isActivatingLeverage = !useLeverage;
                            setUseLeverage(isActivatingLeverage);
                            retriggerLeverage(isDeposit, debtAmount, debtAmountNum, true);
                        }} />
                    }
                </HStack>
            </VStack>
        }
    </Stack>

    const dbrDurationInputs = <AutoBuyDbrDurationInputs
        duration={duration}
        durationType={durationType}
        durationTypedValue={durationTypedValue}
        handleDurationChange={handleDurationChange}
        dbrBuySlippage={dbrBuySlippage}
        setDbrBuySlippage={setDbrBuySlippage}
    />

    const sellDbrInput = <SellDbrInput
        dbrSellAmount={dbrSellAmount}
        setDbrSellAmount={setDbrSellAmount}
        helperAddress={useLeverageInMode ? F2_ALE : F2_HELPER}
        dbrBuySlippage={dbrBuySlippage}
        setDbrBuySlippage={setDbrBuySlippage}
        signer={signer}
        dbrBalance={dbrBalance}
        bnDbrBalance={bnDbrBalance}
    />

    const actionBtn = <HStack>
        <SimpleAmountForm
            defaultAmount={isRepayCase ? debtAmount : collateralAmount}
            address={isWithdrawOnlyCase || isBorrowOnlyCase ? '' : isRepayCase ? DOLA : isUseNativeCoin ? '' : market.collateral}
            destination={useLeverageInMode ? F2_ALE : isAutoDBR || isUseNativeCoin ? F2_HELPER : market.address}
            needApprove={(!isDeleverageCase || (isDeleverageCase && debtAmountNum > 0)) && !(useLeverageInMode && isDeposit && !collateralAmountNum)}
            signer={signer}
            decimals={colDecimals}
            maxAmountFrom={isDeposit ? [bnCollateralBalance] : [bnDeposits, bnWithdrawalLimit]}
            onAction={({ bnAmount }) => handleAction()}
            onMaxAction={({ bnAmount }) => handleWithdrawMax()}
            actionLabel={actionBtnLabel}
            approveLabel={(isAutoDBR || useLeverage) && isDeposit ? 'Step 1/3 - Approve' : undefined}
            maxActionLabel={'Unstake all'}
            onAmountChange={handleCollateralChange}
            showMaxBtn={market.isInv && isWithdrawCase && !debt}
            isDisabled={disabledConditions[MODES[mode]]}
            hideInputIfNoAllowance={false}
            hideInput={true}
            hideButtons={false}
            onSuccess={onSuccess}
            enableCustomApprove={true}
            inputProps={isDeleverageCase ? { disabled: true, placeholder: `Repay via deleverage: ~${debtAmount}` } : undefined}
            btnProps={{
                h: '50px',
                w: 'fit-content',
                fontSize: '18px',
                gaAction: 'FiRM-action-btn-standard',
                needPoaFirst: isDeposit,
            }} />
    </HStack>

    return <Stack
        direction={{ base: 'column', xl: 'row' }}
        w='full'
        spacing="4"
    >
        <WethModal isOpen={isWethSwapModalOpen} onClose={onWethSwapModalClose} />
        <Container
            noPadding
            p="0"
            w='full'
            contentProps={{ minH: '230px', position: 'relative', id: 'f2-combined-form' }}
            {...props}
        >
            {
                (deposits > 0 || debt > 0 || !isDeposit) && <FirmExitModeSwitch isDeposit={isDeposit} handleDirectionChange={handleDirectionChange} isInv={market.isInv} />
            }
            <VStack justify="space-between" position="relative" w='full' px='2%' py="2" alignItems="center" spacing="4">
                <NavButtons
                    active={mode}
                    options={isDeposit ? inOptions : outOptions}
                    onClick={(v) => setMode(v)}
                    isStaking={market.isInv}
                />
                <Stack justify="space-between" w='full' spacing="4" direction={{ base: 'column' }}>
                    {mainFormInputs}
                    {
                        !market.isInv && <VStack display={(useLeverageInMode || (useLeverage && userNotEligibleForLeverage)) ? 'inline-block' : 'none'}>
                            <FirmBoostInfos
                                type={isDeposit ? 'up' : 'down'}
                                onLeverageChange={({
                                    dolaAmount, collateralAmount, isLeverageUp
                                }) => {
                                    if (isLeverageUp) {
                                        handleDebtChange(Math.abs(dolaAmount).toFixed(2));
                                        setLeverageCollateralAmount(Math.abs(collateralAmount).toFixed(8));
                                    } else {
                                        handleCollateralChange(Math.abs(collateralAmount).toFixed(8));
                                        setLeverageDebtAmount(Math.abs(dolaAmount).toFixed(2));
                                    }
                                }}
                            />
                        </VStack>
                    }
                    {['d&b', 'borrow'].includes(MODES[mode]) && isAutoDBR && <Divider borderColor="#cccccc66" />}
                    {['d&b', 'borrow'].includes(MODES[mode]) && isAutoDBR && dbrDurationInputs}
                    {['r&w', 'repay'].includes(MODES[mode]) && isAutoDBR && sellDbrInput}
                </Stack>
                {
                    collateralAmountNum > collateralBalance && isDeposit && <NotEnoughCollateralMessage />
                }
                {
                    market.isInv && <>
                        <Divider />
                        <DBRAutoRepayCalculator
                            invStakedViaDistributor={market?.invStakedViaDistributor}
                            dbrYearlyRewardRate={market?.dbrYearlyRewardRate}
                            newTotalDebt={newTotalDebt}
                            newDeposits={newDeposits}
                            deposits={deposits}
                            handleCollateralChange={handleCollateralChange}
                        />
                    </>
                }
                <Divider />
                <HStack>
                    {actionBtn}
                </HStack>
            </VStack>
        </Container>
        <Container
            noPadding
            w='full'
            contentProps={{ minH: '230px', id: 'f2-recap-container', h: { base: 'auto', md: '100%' } }}
            p="0"
        >
            <VStack position="relative" w='full' px='2%' py="2" alignItems="center" justify="space-between" spacing="2">
                <F2FormInfos
                    collateralAmountNumInfo={hasCollateralChange ? collateralAmountNum : 0}
                    debtAmountNumInfo={hasDebtChange ? isDeposit ? debtAmountNum : Math.min(debtAmountNum, debt) : 0}
                />
                {
                    showResultingLimitTooHigh && !leverageLoading && <ResultingBorrowLimitTooHighMessage />
                }
                {
                    market.borrowPaused ? <BorrowPausedMessage /> : market.leftToBorrow < 1 && isBorrowCase && <NoDolaLiqMessage />
                }
                {
                    !isLargerThan && actionBtn
                }
            </VStack>
        </Container>
    </Stack>
}