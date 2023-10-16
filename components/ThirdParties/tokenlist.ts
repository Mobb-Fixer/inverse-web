import { CHAIN_TOKENS } from "@app/variables/tokens"
import { UNISWAP_TOKENS } from "./uniswaptokens";

// specific format for bridging
const entries = Object.entries(CHAIN_TOKENS);
const orders = {
    "DOLA": 1,
    "INV": 2,
    "DBR": 3,
}

const MAIN_SYMBOLS = ['INV', 'DOLA', 'DBR', 'USDC', 'USDT', 'DAI', 'WETH', 'FRAX', 'WBTC', 'MATIC', 'OP', 'ARB', 'BNB', 'ETH', 'AVAX'];

export const TOKENS_ARRAY = entries.flatMap(([chainId, chainList]) => {
    const tokens = Object.values(chainList)
        .filter(token => MAIN_SYMBOLS.includes(token.symbol));
    return tokens.map(token => {
        return {
            chainId: parseInt(chainId),
            address: token.address,
            name: token.name,
            symbol: token.symbol,
            decimals: token.decimals,
            logoURI: token.image,
            order: orders[token.symbol] ?? Infinity
        }
    });
}).map(token => {
    return { ...token, address: token.address || '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' };
}).sort((a, b) => a.order - b.order);

export const ENSO_INTEGRATIONS = {
    '1-0xE57180685E3348589E9521aa53Af0BCD497E884d': true,
    '42161-0x8bc65Eed474D1A00555825c91FeAb6A8255C2107': true,
};

export const ZAP_TOKENS_ARRAY = entries.flatMap(([chainId, chainList]) => {
    const tokens = Object.values(chainList)
        .filter(token => MAIN_SYMBOLS.includes(token.symbol) || !!ENSO_INTEGRATIONS[`${chainId}-${token.address}`]);
    return tokens.map(token => {
        return {
            chainId: parseInt(chainId),
            ...token,
            order: orders[token.symbol] ?? Infinity
        }
    });
}).map(token => {
    return { ...token, address: token.address || '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' };
}).sort((a, b) => a.order - b.order);

const uniswapMinusMain = UNISWAP_TOKENS
    // exclude very old INV token on polygon
    .filter(token => token.chainId !== 137 && token.symbol !== 'INV')
    .filter(token => !TOKENS_ARRAY.find(mainToken => mainToken.chainId === token.chainId && mainToken.address.toLowerCase() === token.address.toLowerCase()));

export const EXTENDED_TOKENS_ARRAY = TOKENS_ARRAY
    .concat(uniswapMinusMain)    
    .sort((a, b) => a.order - b.order);

export const MAIN_TOKENS_ARRAY = EXTENDED_TOKENS_ARRAY.filter(token => MAIN_SYMBOLS.includes(token.symbol));
