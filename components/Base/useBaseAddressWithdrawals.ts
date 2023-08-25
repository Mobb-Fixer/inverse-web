import { getPublicRpcProvider } from "@app/hooks/useSpecificChainBalance";
import { NetworkIds } from "@app/types";
import { L2_TOKEN_ABI, WithdrawalItem, getBaseAddressWithrawals } from "@app/util/base";
import { Web3Provider } from "@ethersproject/providers";
import { Contract } from "ethers";
import useSWR from "swr"

export const useBaseAddressWithdrawals = (
    account: string | undefined,
    chainId: number | undefined,
    ethProvider: Web3Provider | undefined,
): {
    transactions: WithdrawalItem[],
    hasError: boolean,
    isLoading: boolean,
    error: any,
} => {
    const { data, error } = useSWR(`base-withdrawals-${account}-${chainId}`, async () => {
        if (!account || chainId?.toString() !== NetworkIds.mainnet || !ethProvider) return null;
        return await getBaseAddressWithrawals(ethProvider, account);
    });

    const hasError = !!error || !!data?.hasError;
    
    return {
        transactions: data?.results || [],
        hasError,
        error: data?.error || error,
        isLoading: !hasError && !data?.results,
    }
}

export const useBaseToken = (
    adOnBase: string,
    account: string | undefined
) => {
    const args = [
        [adOnBase, 'decimals'],
        [adOnBase, 'symbol'],
    ];
    if (!!account) {
        args.push([adOnBase, 'balanceOf', account]);
    }

    const baseProvider = getPublicRpcProvider(NetworkIds.base)!;

    const { data, error } = useSWR(`base-token-${adOnBase}`, async () => {
        if (!adOnBase) return null;
        const baseTokenContract = new Contract(adOnBase, L2_TOKEN_ABI, baseProvider);
        return await Promise.all([
            baseTokenContract.decimals(),
            baseTokenContract.symbol(),
            baseTokenContract.l1Token(),
        ]);
    });

    const [decimals, symbol, l1Token] = data || [18, '', ''];
    return {
        decimals,
        symbol,
        l1Token,
        isLoading: !data && !error,
        hasError: !data && !!error,
    };
}