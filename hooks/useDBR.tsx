import { F2_SIMPLE_ESCROW } from "@app/config/abis";
import { F2Market, SWR } from "@app/types"
import { getBnToNumber } from "@app/util/markets";
import { getNetworkConfigConstants } from "@app/util/networks"
import { getToken, TOKENS } from "@app/variables/tokens";
import { BigNumber } from "ethers/lib/ethers";
import useEtherSWR from "./useEtherSWR"
import { fetcher } from '@app/util/web3'
import { useCustomSWR } from "./useCustomSWR";
import { useLpPrice } from "./usePrices";
import { CHAIN_ID } from "@app/config/constants";

const { DBR, F2_MARKETS, F2_ORACLE, DOLA } = getNetworkConfigConstants();

const zero = BigNumber.from('0');
const oneDay = 86400000;
const oneYear = oneDay * 365;

export const useAccountDBR = (
  account: string | undefined | null,
  previewDebt?: number,
): SWR & {
  balance: number,
  debt: number,
  interests: number,
  signedBalance: number,
  dailyDebtAccrual: number,
  dbrNbDaysExpiry: number,
  dbrExpiryDate: number | null,
  dbrDepletionPerc: number,
  bnDebt: BigNumber,
} => {
  const { data, error } = useEtherSWR([
    [DBR, 'balanceOf', account],
    [DBR, 'debts', account],
    [DBR, 'dueTokensAccrued', account],
    [DBR, 'signedBalanceOf', account],
    // [DBR, 'lastUpdated', account],
  ]);

  const [balance, debt, interests, signedBalance] = (data || [zero, zero, zero, zero, zero])
    .map(v => getBnToNumber(v));
  // const [balance, allowance, debt, interests, signedBalance] = [100, 0, 5000, 0, 2500];

  // interests are not auto-compounded
  const _debt = previewDebt ?? debt;
  const dailyDebtAccrual = (oneDay * _debt / oneYear);
  // at current debt accrual rate, when will DBR be depleted?
  const dbrNbDaysExpiry = dailyDebtAccrual ? balance / dailyDebtAccrual : 0;
  const dbrExpiryDate = !_debt ? null : (+new Date() + dbrNbDaysExpiry * oneDay);
  const dbrDepletionPerc = dbrNbDaysExpiry / 365 * 100;

  return {
    balance,
    debt: _debt,
    interests,
    signedBalance,
    dailyDebtAccrual,
    dbrNbDaysExpiry,
    dbrExpiryDate,
    dbrDepletionPerc,
    bnDebt: data ? data[1] : zero,
    isLoading: !error && !data,
    isError: error,
  }
}

export const useDBRMarkets = (marketOrList?: string | string[]): {
  markets: F2Market[]
} => {
  const { data: apiData } = useCustomSWR(`/api/f2/fixed-markets`, fetcher);
  const _markets = Array.isArray(marketOrList) ? marketOrList : !!marketOrList ? [marketOrList] : [];

  const cachedMarkets = (apiData?.markets || F2_MARKETS)
    .filter(m => !!marketOrList ? _markets.includes(m.name) : true);

  const markets = F2_MARKETS
    .filter(m => !!marketOrList ? _markets.includes(m.name) : true)
    .map(m => {
      return {
        ...m,
        underlying: TOKENS[m.collateral],
      }
    });

  const nbMarkets = markets.length;

  const { data, error } = useEtherSWR([
    ...markets.map(m => {
      return [F2_ORACLE, 'getPrice', m.collateral]
    }),
    ...markets.map(m => {
      return [m.address, 'collateralFactorBps']
    }),
    ...markets.map(m => {
      return [m.address, 'totalDebt']
    }),
    ...markets.map(m => {
      return [DOLA, 'balanceOf', m.address]
    }),
  ]);

  return {
    markets: markets.map((m, i) => {
      return {
        ...m,
        ...cachedMarkets[i],
        supplyApy: 0,
        price: data ? getBnToNumber(data[i * nbMarkets]) : cachedMarkets[i].price ?? 0,
        collateralFactor: data ? getBnToNumber(data[i * nbMarkets + 1], 4) : cachedMarkets[i].collateralFactor ?? 0,
        totalDebt: data ? getBnToNumber(data[i * nbMarkets + 2]) : cachedMarkets[i].totalDebt ?? 0,
        bnDolaLiquidity: data ? data[i * nbMarkets + 3] : cachedMarkets[i].bnDolaLiquidity ?? 0,
        dolaLiquidity: data ? getBnToNumber(data[i * nbMarkets + 3]) : cachedMarkets[i].dolaLiquidity ?? 0,
      }
    }),
  }
}

type AccountDBRMarket = F2Market & {
  account: string | undefined | null
  escrow: string | undefined
  deposits: number
  bnDeposits: BigNumber
  creditLimit: number
  bnCreditLimit: BigNumber
  withdrawalLimit: number
  bnWithdrawalLimit: BigNumber
  creditLeft: number
  perc: number
  debt: number
  bnDebt: BigNumber
  bnCollateralBalance: BigNumber
  collateralBalance: number
  hasDebt: boolean
  liquidationPrice: number | null
}

export const useAccountDBRMarket = (
  market: F2Market,
  account: string,
): AccountDBRMarket => {
  const { data: accountMarketData, error } = useEtherSWR([
    [market.address, 'escrows', account],
    [market.address, 'getCreditLimit', account],
    [market.address, 'getWithdrawalLimit', account],
    [market.address, 'debts', account],
  ]);

  const { data: balances } = useEtherSWR([
    [market.collateral, 'balanceOf', account],
  ]);

  const [escrow, bnCreditLimit, bnWithdrawalLimit, bnDebt] = accountMarketData || [undefined, zero, zero, zero];
  const [bnCollateralBalance]: BigNumber[] = balances || [zero];

  const { data: escrowData } = useEtherSWR({
    args: [[escrow, 'balance']],
    abi: F2_SIMPLE_ESCROW,
  });
  const bnDeposits = (escrowData ? escrowData[0] : zero);

  const decimals = market.underlying.decimals;

  const { deposits, withdrawalLimit } = {
    deposits: bnDeposits ? getBnToNumber(bnDeposits, decimals) : 0,
    withdrawalLimit: bnWithdrawalLimit ? getBnToNumber(bnWithdrawalLimit, decimals) : 0,
  }

  const hasDebt = !!deposits && !!withdrawalLimit && deposits > 0 && deposits !== withdrawalLimit;
  const debt = bnDebt ? getBnToNumber(bnDebt) : 0;
  const perc = Math.max(hasDebt ? withdrawalLimit / deposits * 100 : deposits ? 100 : 0, 0);

  const creditLeft = withdrawalLimit * market?.price * market.collateralFactor;
  const liquidationPrice = hasDebt ? debt / (market.collateralFactor * deposits) : null;

  return {
    ...market,
    account,
    escrow,
    deposits,
    bnDeposits,
    creditLimit: bnCreditLimit ? getBnToNumber(bnCreditLimit) : 0,
    bnCreditLimit,
    withdrawalLimit,
    bnWithdrawalLimit,
    debt,
    bnDebt,
    creditLeft,
    perc,
    hasDebt,
    liquidationPrice,
    bnCollateralBalance,
    collateralBalance: (bnCollateralBalance ? getBnToNumber(bnCollateralBalance, decimals) : 0),
  }
}

export const useAccountF2Markets = (
  markets: F2Market[],
  account: string,
): AccountDBRMarket[] => {
  return markets.map(m => {
    const accountData = useAccountDBRMarket(m, account);
    return { ...m, ...accountData }
  });
}

export const useDBRPrice = (): { price: number } => {
  const weth = getToken(TOKENS, 'WETH')
  const { data } = useEtherSWR({
    args: [      
        [
          // sushi
          '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
          'getAmountsOut',
          '1000000000000000000',
          [weth.address, DBR],
        ],      
    ],
    abi: ['function getAmountsOut(uint256, address[]) public view returns (uint256[])']
  })
  const { data: ethPrice } = useEtherSWR({
    args: [
      ['0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e', 'latestAnswer'],
    ],
    abi: ['function latestAnswer() public view returns (uint256)'],
  });
  const out = data && data[0] ? getBnToNumber(data[0][1]) : 0;
  // use coingecko as fallback when ready
  return {
    price: ethPrice ? getBnToNumber(ethPrice[0], 8) / out : 0.05
  }
}