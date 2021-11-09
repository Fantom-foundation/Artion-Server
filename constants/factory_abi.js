const CollectionFactoryContract = {
  MAINNET_721_PRIVATE: '0xe5841838Dd7e522f217DfFBCEaef82F04EC649Cd', //FantomNFTFactoryPrivate
  MAINNET_721_PUBLIC: '0xCC7A2eC7A8A0564518fD3D2ca0Df8B2137626144', //FantomNFTFactory
  TESTNET_721_PRIVATE: '0x7d3bb8dD1f3b123C6DFEf882709Fadc007ee4532', //FantomNFTFactoryPrivate
  TESTNET_721_PUBLIC: '0x7C8a9F8D04d9f7601E04B4bd3f594F6aB42b1231', //FantomNFTFactory
  MAINNET_1155_PRIVATE: '0x736Eae40AdFf88570b92378c97a0D11b44E1C953', //FantomArtFactoryPrivate
  MAINNET_1155_PUBLIC: '0x520DaB621f93F59d3557174280AB1B6d4FB8c956', //FantomArtFactory
  TESTNET_1155_PRIVATE: '0x0106fe87F41BAa91D6fe52c508723e8cf5082c49', //FantomArtFactoryPrivate
  TESTNET_1155_PUBLIC: '0x980A2fAC219CD4e26033E82A44D6798F7488aDb2', //FantomArtFactory
  ABI: [
    {
      inputs: [{ internalType: 'address', name: '', type: 'address' }],
      name: 'exists',
      outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
      stateMutability: 'view',
      type: 'function'
    }
  ]
};

module.exports = CollectionFactoryContract;
