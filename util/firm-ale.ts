import { BigNumber, Contract } from "ethers";
import { getNetworkConfigConstants } from "./networks";
import { JsonRpcSigner } from "@ethersproject/providers";
import { F2_ALE_ABI, F2_MARKET_ABI } from "@app/config/abis";
import { f2approxDbrAndDolaNeeded, getFirmSignature, getHelperDolaAndDbrParams } from "./f2";
import { F2Market } from "@app/types";
import { getBnToNumber, getNumberToBn } from "./markets";
import { callWithHigherGL } from "./contracts";
import { parseUnits } from "@ethersproject/units";

const { F2_ALE, DOLA } = getNetworkConfigConstants();

export const getAleContract = (signer: JsonRpcSigner) => {
    return new Contract(F2_ALE, F2_ALE_ABI, signer);
}

export const ALE_SWAP_PARTNER = '1inch'

export const prepareLeveragePosition = async (
    signer: JsonRpcSigner,
    market: F2Market,
    dolaToBorrowToBuyCollateral: BigNumber,
    initialDeposit?: BigNumber,
    slippagePerc?: string | number,
    dbrBuySlippage?: string | number,
    durationDays?: number,
) => {
    let dbrApprox;
    let dbrInputs = { dolaParam: '0', dbrParam: '0' };
    if(durationDays && dbrBuySlippage) {
        dbrApprox = await f2approxDbrAndDolaNeeded(signer, dolaToBorrowToBuyCollateral, dbrBuySlippage, durationDays);
        dbrInputs = getHelperDolaAndDbrParams('curve-v2', durationDays, dbrApprox);
    }
    const totalDolaToBorrow = dbrApprox?.maxDola || dolaToBorrowToBuyCollateral;
    // in ALE totalDolaToBorrow will be minted and borrowed
    const signatureResult = await getFirmSignature(signer, market.address, totalDolaToBorrow, 'BorrowOnBehalf', F2_ALE);

    if (signatureResult) {
        const { deadline, r, s, v } = signatureResult;
        let aleQuoteResult;
        try {
            // the dola swapped for collateral is dolaToBorrowToBuyCollateral not totalDolaToBorrow (a part is for dbr)
            aleQuoteResult = await getAleSellQuote(market.collateral, DOLA, dolaToBorrowToBuyCollateral.toString(), slippagePerc, false);
            if (!aleQuoteResult?.data || !!aleQuoteResult.msg) {
                const msg = aleQuoteResult?.validationErrors?.length > 0 ?
                    `Swap validation failed with: ${aleQuoteResult?.validationErrors[0].field} ${aleQuoteResult?.validationErrors[0].reason}`
                    : `Getting a quote from ${ALE_SWAP_PARTNER} failed`;
                return Promise.reject(msg);
            }
        } catch (e) {
            console.log(e);
            return Promise.reject(`Getting a quote from ${ALE_SWAP_PARTNER} failed`);
        }
        const { data: swapData, allowanceTarget, value } = aleQuoteResult;
        const permitData = [deadline, v, r, s];
        const helperTransformData = '0x';
        // dolaIn, minDbrOut
        const dbrData = [dbrInputs.dolaParam, dbrInputs.dbrParam, '0'];        
        if (initialDeposit && initialDeposit.gt(0)) {
            return depositAndLeveragePosition(
                signer,
                dolaToBorrowToBuyCollateral,
                market.address,
                allowanceTarget,
                swapData,
                permitData,
                helperTransformData,
                dbrData,
                initialDeposit,
                value,
            )
        }
        return leveragePosition(
            signer, dolaToBorrowToBuyCollateral, market.address, allowanceTarget, swapData, permitData, helperTransformData, dbrData, value,
        );
    }
    return Promise.reject("Signature failed or canceled");
}

export const leveragePosition = (
    signer: JsonRpcSigner,
    dolaToBorrow: BigNumber,
    marketAd: string,
    zeroXspender: string,
    swapData: string,
    permitTuple: any[],
    helperTransformData: string,
    dbrTuple: any[],
    ethValue?: string,
) => {
    return callWithHigherGL(
        getAleContract(signer),
        'leveragePosition',
        [dolaToBorrow, marketAd, zeroXspender, swapData, permitTuple, helperTransformData, dbrTuple],
        200000,
        { value: ethValue },
    );
}

export const depositAndLeveragePosition = (
    signer: JsonRpcSigner,
    dolaToBorrow: BigNumber,
    marketAd: string,
    zeroXspender: string,
    swapData: string,
    permitTuple: any[],
    helperTransformData: string,
    dbrTuple: any[],
    initialDeposit: BigNumber,
    ethValue?: string,
) => {
    return callWithHigherGL(
        getAleContract(signer),
        'depositAndLeveragePosition',
        [initialDeposit, dolaToBorrow, marketAd, zeroXspender, swapData, permitTuple, helperTransformData, dbrTuple],
        200000,
        { value: ethValue },
    )
}

export const prepareDeleveragePosition = async (
    signer: JsonRpcSigner,
    market: F2Market,
    extraDolaToRepay: BigNumber,
    collateralToWithdraw: BigNumber,
    slippagePerc?: string | number,
    dbrToSell?: BigNumber,
    minDolaOut?: BigNumber,
) => {
    let aleQuoteResult;
    // we need the quote first
    try {
        // the dola swapped for collateral is dolaToRepayToSellCollateral not totalDolaToBorrow (a part is for dbr)
        aleQuoteResult = await getAleSellQuote(DOLA, market.collateral, collateralToWithdraw.toString(), slippagePerc, false);
        if (!aleQuoteResult?.data || !!aleQuoteResult.msg) {
            const msg = aleQuoteResult?.validationErrors?.length > 0 ?
                `Swap validation failed with: ${aleQuoteResult?.validationErrors[0].field} ${aleQuoteResult?.validationErrors[0].reason}`
                : `Getting a quote from ${ALE_SWAP_PARTNER} failed`;
            return Promise.reject(msg);
        }
    } catch (e) {
        console.log(e);
        return Promise.reject(`Getting a quote from ${ALE_SWAP_PARTNER} failed`);
    }

    const signatureResult = await getFirmSignature(signer, market.address, collateralToWithdraw, 'WithdrawOnBehalf', F2_ALE);

    if (signatureResult) {
        const { deadline, r, s, v } = signatureResult;

        const { data: swapData, allowanceTarget, value, buyAmount } = aleQuoteResult;
        const permitData = [deadline, v, r, s];
        const helperTransformData = '0x';
        const dolaBuyAmount = parseUnits(buyAmount, 0);
        const userDebt = await (new Contract(market.address, F2_MARKET_ABI, signer)).debts(await signer.getAddress());
        const minDolaAmountFromSwap = getNumberToBn(getBnToNumber(dolaBuyAmount) * (1-parseFloat(slippagePerc)/100));
        const minDolaOrMaxRepayable = minDolaAmountFromSwap.gt(userDebt) ? userDebt : minDolaAmountFromSwap;
        
        // dolaIn, minDbrOut, extraDolaToRepay
        const dbrData = [dbrToSell, minDolaOut, extraDolaToRepay];
        return deleveragePosition(
            signer,
            minDolaOrMaxRepayable,
            market.address,
            collateralToWithdraw,
            allowanceTarget,
            swapData,
            permitData,
            helperTransformData,
            dbrData,
            value,
        );
    }
    return Promise.reject("Signature failed or canceled");
}

export const deleveragePosition = async (
    signer: JsonRpcSigner,
    dolaToRepay: BigNumber,
    marketAd: string,
    amountToWithdraw: BigNumber,
    zeroXspender: string,
    swapData: string,
    permitTuple: any[],
    helperTransformData: string,
    dbrTuple: any[],
    value: string,
) => {
    return callWithHigherGL(
        getAleContract(signer),
        'deleveragePosition',
        [
            dolaToRepay,
            marketAd,
            amountToWithdraw,
            zeroXspender,
            swapData,
            permitTuple,
            helperTransformData,
            dbrTuple,
        ],
        200000,
        { value },
    );
}

export const getAleSellQuote = async (
    buyAd: string,
    sellAd: string,
    sellAmount: string,
    slippagePercentage = '1',
    getPriceOnly = false,
) => {
    const method = getPriceOnly ? 'quote' : 'swap';    
    let url = `/api/f2/1inch-proxy?method=${method}&buyToken=${buyAd.toLowerCase()}&sellToken=${sellAd.toLowerCase()}&sellAmount=${sellAmount}&slippagePercentage=${slippagePercentage}`;
    const response = await fetch(url);
    return response.json();
}
// will do a binary search
export const getAleSellEnoughToRepayDebt = async (
    buyAd: string,
    sellAd: string,
    debt: string,
    deposits: string,    
) => {    
    let url = `/api/f2/1inch-proxy?isFullDeleverage=true&method=quote&buyToken=${buyAd.toLowerCase()}&sellToken=${sellAd.toLowerCase()}&debt=${debt}&deposits=${deposits}`;
    const response = await fetch(url);
    return response.json();
}