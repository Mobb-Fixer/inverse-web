import { NetworkIds } from '@app/types';

const mainConfig = {
    INVDOLASLP: '0x5BA61c0a8c4DccCc200cd0ccC40a5725a426d002',
    DOLA3POOLCRV: '0xAA5A67c256e27A5d80712c51971408db3370927D',
    DOLA_PAYROLL: '0x32edDd879B199503c6Fc37DF95b8920Cd415358F',
    DEPLOYER: '0x3FcB35a1CbFB6007f9BC638D388958Bc4550cB28',
    stabilizer: '0x7eC0D931AFFBa01b77711C2cD07c76B970795CDd',
    harvester: '0xb677e5c5cbc42c25bff9578dda2959adb7eecc96',
    // governance alpha (old)
    governanceAlpha: '0x35d9f4953748b318f18c30634bA299b237eeDfff',
    // governance mills (old mills)
    // governance: '0xeF3bD8cA3beAC259D898b2C546F804B49D52e2FD',
    // governance mills (new mills)
    governance: '0xBeCCB6bb0aa4ab551966A7E4B97cec74bb359Bf6',
    // multiDelegator
    multiDelegator: '0x1ba87bE4C20Fa2d4cbD8e4Ae9998649226207F76',
    xinvManager: '0x07eB8fD853c847d6E25F29e566d605cFf474909D',
    policyCommittee: '0x4b6c63E6a94ef26E2dF60b89372db2d8e211F1B7',
    opBondManager: '0x9de7b925247c9bd98ecee5abb7ea06a4aa7d13cd',
    xinvVestorFactory: '0xe1C67007D1074bcAcC577DD946661F0CB9053A19',
    vesters: [
        "0x60f491CEF0602eaC0b485e6551eeE2eFee934546",
        "0x5D4bd975b8eB5A0AA8bEDf765929DB98cA6A44a1",
        "0xcc2CFcDf943C89718020BFC612CA06a2B3A83005",
        "0xDA37E0458f3828C0073F40B2CEBD8084e978d4BA",
        "0xB422De4b9707E0a209695c96CCbBF6F53d36dF96",
        "0x703b74Af27d80bb3828Cdb0Aa4a9bed26b98D438",
        "0x52306b083CDDa14621160A560eF7d0309286748C",
        "0x38843a25edCc739C8600E2AD6C0caF6b03cc58f5",
        "0x90b7A0B834c830Aca8Cb9561A33e8C59E1248634",
        "0x849e21c3FB182D3D359595B0097b4AA249c16366",
    ],
    multisigs: [
        {
            address: '0x9D5Df30F475CEA915b1ed4C0CCa59255C897b61B',
            name: 'Treasury Working Group',
            shortName: 'TWG',
            purpose: 'Optimize Inverse Treasury management on Ethereum',
            governanceLink: 'https://www.inverse.finance/governance/proposals/mills/10',
            chainId: NetworkIds.mainnet,
        },
        {
            address: '0x7f063F7B7A1326eE8B64ACFdc81Bf544ecc974bC',
            name: 'Treasury Working Group on Fantom',
            shortName: 'TWG on FTM',
            purpose: 'Optimize Inverse Treasury management on Fantom',
            governanceLink: 'https://www.inverse.finance/governance/proposals/mills/10',
            chainId: NetworkIds.ftm,
        },
        {
            address: '0x4b6c63E6a94ef26E2dF60b89372db2d8e211F1B7',
            name: 'Policy Committee',
            shortName: 'PC',
            purpose: 'Handle Reward Rates and Bonds Policies',
            governanceLink: 'https://www.inverse.finance/governance/proposals/mills/6',
            chainId: NetworkIds.mainnet,
        },
        {
            address: '0x07de0318c24D67141e6758370e9D7B6d863635AA',
            name: 'Growth Working Group',
            shortName: 'GWG',
            purpose: 'Handle Investments & Costs regarding Growth',
            governanceLink: 'https://www.inverse.finance/governance/proposals/mills/5',
            chainId: NetworkIds.mainnet,
        },
        {
            address: '0xa40FBd692350C9Ed22137F97d64E6Baa4f869E8C',
            name: 'Community Working Group',
            shortName: 'CWG',
            purpose: 'Boost Community participation and improve On-Boarding',
            governanceLink: 'https://www.inverse.finance/governance/proposals/mills/14',
            chainId: NetworkIds.mainnet,
        },
        {
            address: '0x943dBdc995add25A1728A482322F9b3c575b16fb',
            name: 'Bug Bounty Program',
            shortName: 'BBP',
            purpose: 'Handle rewards for Bug Bounties',
            governanceLink: 'https://www.inverse.finance/governance/proposals/mills/17',
            chainId: NetworkIds.mainnet,
        },
        // '0x77C64eEF5F4781Dd6e9405a8a77D80567CFD37E0': 'Rewards Committee',
    ],
};

export const EXTRA_CONFIG = {
    "1": mainConfig,
    "31337": mainConfig,
}