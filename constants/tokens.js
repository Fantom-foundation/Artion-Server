const DISABLED_PAYTOKENS = process.env.NETWORK_CHAINID === "250" ? [
    {
      address: '0x0000000000000000000000000000000000000000',
      name: 'Fantom',
      symbol: 'ftm',
      decimals: 18,
    }
  ] :
  [
    {
      address: '0x0000000000000000000000000000000000000000',
      name: 'Fantom',
      symbol: 'ftm',
      decimals: 18,
    }
  ]


const PAYTOKENS = process.env.NETWORK_CHAINID === "250" ? [
    {
      address: '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83',
      name: 'Wrapped Fantom',
      symbol: 'wftm',
      decimals: 18,
    },
    {
      address: '0x049d68029688eabf473097a2fc38ef61633a3c7a',
      name: 'Tether USD',
      symbol: 'fusdt',
      decimals: 6,
    },
    {
      address: '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
      name: 'USD Coin',
      symbol: 'usdc',
      decimals: 6,
    },
    {
      address: '0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e',
      name: 'Dai Stablecoin',
      symbol: 'dai',
      decimals: 18,
    },
  ] :
  [
    {
      address: '0xf1277d1ed8ad466beddf92ef448a132661956621',
      name: 'Wrapped Fantom',
      symbol: 'wftm',
      decimals: 18,
    },
  ]

module.exports = { PAYTOKENS, DISABLED_PAYTOKENS };
