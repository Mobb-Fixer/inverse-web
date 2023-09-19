/**
 * Extra features specific to certain markets such as claiming rewards
 */

import { CONVEX_REWARD_POOL, F2_ESCROW_ABI, ST_CVX_CRV_ABI } from "@app/config/abis"
import { JsonRpcSigner } from "@ethersproject/providers";
import { Contract } from "ethers"
import { getBnToNumber } from "./markets";

// Only for cvxCRV escrow
export const setRewardWeight = (escrow: string, newValueBps: string | number, signer: JsonRpcSigner) => {
    const contract = new Contract(escrow, F2_ESCROW_ABI, signer);
    return contract.setRewardWeight(newValueBps);
}

export const getCvxCrvRewards = (escrow: string, signer: JsonRpcSigner) => {
    const contract = new Contract('0xaa0C3f5F7DFD688C6E646F66CD2a6B66ACdbE434', ST_CVX_CRV_ABI, signer);
    return contract.callStatic.earned(escrow);
}

export const getCvxRewards = async (escrow: string, signer: JsonRpcSigner) => {
    const contract = new Contract('0xCF50b810E57Ac33B91dCF525C6ddd9881B139332', CONVEX_REWARD_POOL, signer);
    const extraRewardsLength = await contract.extraRewardsLength();
    const extraRewards = [];
    for(let i = 0; i < extraRewardsLength; i++) {
        const extraReward = await contract.extraRewards(i);
        extraRewards.push(extraReward);
    }
    const earned =  await contract.earned(escrow);
    return {
        extraRewardsLength: getBnToNumber(extraRewardsLength, 0),
        earned,
        extraRewards,
    }
}

// Generic claim function for an escrow with rewards
export const claim = async (escrow: string, signer: JsonRpcSigner, methodName = 'claim', extraRewards?: string[]) => {
    if(extraRewards?.length) {
        return claimTo(escrow, await signer.getAddress(), signer, methodName, extraRewards);
    }
    const contract = new Contract(escrow, F2_ESCROW_ABI, signer);
    return contract[methodName]();
}

export const claimTo = (escrow: string, to: string, signer: JsonRpcSigner, methodName = 'claimTo', extraRewards?: string[]) => {
    const contract = new Contract(escrow, F2_ESCROW_ABI, signer);
    if(extraRewards?.length) {
        return contract[methodName](to, extraRewards);    
    }
    return contract[methodName](to);
}