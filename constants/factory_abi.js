const CollectionFactoryContract = {
  MAINNET_721_PRIVATE: '0xe5841838Dd7e522f217DfFBCEaef82F04EC649Cd', //FantomNFTFactoryPrivate
  MAINNET_721_PUBLIC: '0xCC7A2eC7A8A0564518fD3D2ca0Df8B2137626144', //FantomNFTFactory
  TESTNET_721_PRIVATE: '0x49191888c75134E60889c5407A87Cf07F836f677', //FantomNFTFactoryPrivate
  TESTNET_721_PUBLIC: '0x6F124f6DABA769Eb351a1EeC4C0224F9A0a524cE', //FantomNFTFactory
  MAINNET_1155_PRIVATE: '0x736Eae40AdFf88570b92378c97a0D11b44E1C953', //FantomArtFactoryPrivate
  MAINNET_1155_PUBLIC: '0x520DaB621f93F59d3557174280AB1B6d4FB8c956', //FantomArtFactory
  TESTNET_1155_PRIVATE: '0x736Eae40AdFf88570b92378c97a0D11b44E1C953', //FantomArtFactoryPrivate
  TESTNET_1155_PUBLIC: '0x520DaB621f93F59d3557174280AB1B6d4FB8c956', //FantomArtFactory
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
