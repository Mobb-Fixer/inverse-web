import { Token } from "@app/types";

export const IMAGES = {
    INV: "/assets/inv-square-dark.jpeg",
    DOLA: "/assets/v2/dola-small.png",
    DBR: "/assets/v2/dbr.png",
    "3CRV": "https://assets.coingecko.com/coins/images/12972/small/3pool_128.png?1603948039",
}

export const TOKEN_IMAGES = {
    "DOLA-USDC": IMAGES.DOLA,
    "DOLA-USD+": IMAGES.DOLA,
    "DOLA-CUSD": IMAGES.DOLA,
    "DOLA-WBNB": IMAGES.DOLA,
    "DOLA": IMAGES.DOLA,
    "DOLA-3POOL": IMAGES.DOLA,
    "DOLA-FRAX-USDC": IMAGES.DOLA,
    "DOLA-USDC blp": IMAGES.DOLA,
    "DOLA-DBR blp": IMAGES.DOLA,
    "DOLA-bb-e-usd blp": IMAGES.DOLA,
    "DOLA-USDC-LP": IMAGES.DOLA,
    "DOLA-DBR-LP": IMAGES.DOLA,
    "vlDOLA-FRAXBP": IMAGES.DOLA,
    "INV-DOLA-SLP": IMAGES.INV,
    "INV-DOLA-AURA": IMAGES.INV,
    "INV-ETH-SLP": IMAGES.INV,
    "INV-WETH-LP": IMAGES.INV,
    "INV": IMAGES.INV,
    "DBR": IMAGES.DBR,
    "THREECRV": IMAGES["3CRV"],
    "CHRONOS": "https://assets.coingecko.com/coins/images/29622/small/chronos_icono-01.png?1680077336",
    "AVAX": "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png?1670992574",
    "CASH": "https://assets.coingecko.com/coins/images/27558/small/cash.png?1677063931",
    "MATIC": "https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png?1624446912",
    "cvxCRV": 'https://assets.coingecko.com/coins/images/15586/small/convex-crv.png?1621255952',
    "MAI": "https://assets.coingecko.com/coins/images/15264/small/mimatic-red.png?1620281018",
    "ETH": "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
    "DAI": "https://assets.coingecko.com/coins/images/9956/small/dai-multi-collateral-mcd.png",
    "USDT": "https://assets.coingecko.com/coins/images/325/small/Tether-logo.png",
    "USDC": "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png",
    "WETH": "https://assets.coingecko.com/coins/images/2518/small/weth.png",
    "YFI": "https://assets.coingecko.com/coins/images/11849/small/yfi-192x192.png",
    "xSUSHI": "https://assets.coingecko.com/coins/images/13725/small/xsushi.png",
    "WBTC": "https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png",
    "stETH": "https://assets.coingecko.com/coins/images/13442/small/steth_logo.png",
    "gOHM": "https://assets.coingecko.com/coins/images/21129/small/token_wsOHM_logo.png?1638764900",
    "BB-EULER-USD": "https://raw.githubusercontent.com/balancer-labs/assets/master/assets/0x50cf90b954958480b8df7958a9e965752f627124.png",
    "3CRV": IMAGES["3CRV"],
    "crvFRAX": "https://assets.coingecko.com/coins/images/13422/small/frax_logo.png?1608476506",
    "FRAX": "https://assets.coingecko.com/coins/images/13422/small/ethCanonicalFRAX.png?1669277108",
    "FLOKI": "https://assets.coingecko.com/coins/images/16746/small/FLOKI.png?1625835665",
    "WFTM": "https://assets.coingecko.com/coins/images/4001/small/Fantom.png?1558015016",
    "MIM": "https://assets.coingecko.com/coins/images/16786/small/mimlogopng.png?1624979612",
    "yvcrvCVXETH": IMAGES["3CRV"],
    "yvcrvIB": "https://assets.coingecko.com/coins/images/22902/small/ironbank.png?1642872464",
    "yvcrv3Crypto": "https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/multichain-tokens/1/0xc4AD29ba4B3c580e6D59105FFf484999997675Ff/logo-128.png",
    "yvcrvstETH-WETH": "https://assets.coingecko.com/coins/images/13442/small/steth_logo.png",
    "CVX": "https://assets.coingecko.com/coins/images/15585/small/convex.png?1621256328",
    "CRV": "https://assets.coingecko.com/coins/images/12124/small/Curve.png?1597369484",
    "sdCRV": "https://assets.coingecko.com/coins/images/27756/small/scCRV-2.png?1665654580",
    "sdCRV-g": "https://assets.coingecko.com/coins/images/27756/small/scCRV-2.png?1665654580",
    "vlCVX": "https://assets.coingecko.com/coins/images/15585/small/convex.png?1621256328",
    "vlAURA": "https://assets.coingecko.com/coins/images/25942/small/logo.png?1654784187",
    "AURA": "https://assets.coingecko.com/coins/images/25942/small/logo.png?1654784187",
    "BAL": "https://assets.coingecko.com/coins/images/11683/small/Balancer.png?1592792958",
    "yvcrvDOLA": "https://assets.coingecko.com/markets/images/538/small/Curve.png?1591605481",
    "yvUSDC": "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png",
    "yvUSDT": "https://assets.coingecko.com/coins/images/325/small/Tether-logo.png",
    "yvDAI": "https://assets.coingecko.com/coins/images/9956/small/dai-multi-collateral-mcd.png",
    "yvYFI": "https://assets.coingecko.com/coins/images/11849/small/yfi-192x192.png",
    "yvWETH": "https://assets.coingecko.com/coins/images/2518/small/weth.png",
    "VELO": "https://assets.coingecko.com/coins/images/25783/small/velo.png?1653817876",
    "USD+": "https://assets.coingecko.com/coins/images/25757/small/USD__logo.png?1653519267",
    "veVELO": "https://assets.coingecko.com/coins/images/25783/small/velo.png?1653817876",
    "BNB": "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png?1644979850",
    "WBNB": "https://assets.coingecko.com/coins/images/12591/small/binance-coin-logo.png?1600947313",
    "THENA": "https://assets.coingecko.com/coins/images/28864/small/IMG_20230129_155910_852.png?1674984924",
    "veTHENA": "https://assets.coingecko.com/coins/images/28864/small/IMG_20230129_155910_852.png?1674984924",
    "CUSD": "https://assets.coingecko.com/coins/images/26588/small/CUSD-01.png?1658909049",
    "FTM": "https://assets.coingecko.com/coins/images/4001/small/Fantom.png?1558015016",
    "SLIZ": "https://assets.coingecko.com/coins/images/28968/small/sliz-logo.png?1675746291",
    "RAM": "https://assets.coingecko.com/coins/images/29420/small/RAM_Token_32x32.png?1678678321",
    "STR": "https://assets.coingecko.com/coins/images/29167/small/FullLogo_Transparent_NoBuffer.png?1677048104",
    "ARCHLY": "https://s2.coinmarketcap.com/static/img/exchanges/64x64/6432.png",
    "SATIN": "https://assets.coingecko.com/coins/images/29169/small/satin.png?1677050689",
    "SOLISNEK": "https://assets.coingecko.com/markets/images/1121/small/solisnek.jpeg?1681696649",
}

export const PROTOCOL_IMAGES = {
    "VELO": TOKEN_IMAGES.VELO,
    "THENA": TOKEN_IMAGES.THENA,
    "AURA": TOKEN_IMAGES.AURA,
    "CRV": TOKEN_IMAGES.CRV,
    "YFI": TOKEN_IMAGES.YFI,
    "CVX": TOKEN_IMAGES.CVX,
    "SOLISNEK": TOKEN_IMAGES.SOLISNEK,
    "SUSHI": "https://assets.coingecko.com/coins/images/12271/small/512x512_Logo_no_chop.png?1606986688",
    "UNI": "https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png?1600306604",
    "UNIV3": "https://assets.coingecko.com/markets/images/665/small/uniswap-v3.png?1620241698",
    "BAL": "/assets/projects/balancer.png",
    "LIDO": 'https://assets.coingecko.com/coins/images/13573/small/Lido_DAO.png?1609873644',
    'OHM': 'https://assets.coingecko.com/coins/images/14483/small/token_OHM_%281%29.png?1628311611',
    "EULER": 'https://assets.coingecko.com/coins/images/26149/small/YCvKDfl8_400x400.jpeg?1656041509',
    "SOLIDLIZARD": TOKEN_IMAGES.SLIZ,
    "RAMSES": TOKEN_IMAGES.RAM,
    "STERLING": TOKEN_IMAGES.STR,
    "ARCHLY": TOKEN_IMAGES.ARCHLY,
    "SATIN": TOKEN_IMAGES.SATIN,
    "CHRONOS": TOKEN_IMAGES.CHRONOS,
}

export const PROTOCOLS_BY_IMG = Object.fromEntries(
    Object
        .entries(PROTOCOL_IMAGES)
        .map(([key, value]) => [value, key])
);