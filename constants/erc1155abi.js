const ERC1155ABI = {
  RPC: 'https://rpc.ftm.tools/',
  CHAINID: 250,
  ABI: [
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: '_operator',
          type: 'address'
        },
        {
          indexed: true,
          internalType: 'address',
          name: '_from',
          type: 'address'
        },
        {
          indexed: true,
          internalType: 'address',
          name: '_to',
          type: 'address'
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: '_id',
          type: 'uint256'
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: '_value',
          type: 'uint256'
        }
      ],
      name: 'TransferSingle',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: '_operator',
          type: 'address'
        },
        {
          indexed: true,
          internalType: 'address',
          name: '_from',
          type: 'address'
        },
        {
          indexed: true,
          internalType: 'address',
          name: '_to',
          type: 'address'
        },
        {
          indexed: false,
          internalType: 'uint256[]',
          name: '_ids',
          type: 'uint256[]'
        },
        {
          indexed: false,
          internalType: 'uint256[]',
          name: '_values',
          type: 'uint256[]'
        }
      ],
      name: 'TransferBatch',
      type: 'event'
    }
  ]
};

module.exports = ERC1155ABI;
