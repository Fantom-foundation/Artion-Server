const CollectionFactoryContract = {
  MAINNET_721_PRIVATE: '0xa4fDb09e1796730bfBA8a352074F0dd65D400Dd4', //FantomNFTFactoryPrivate
  MAINNET_721_PUBLIC: '0xCC7A2eC7A8A0564518fD3D2ca0Df8B2137626144', //FantomNFTFactory
  TESTNET_721_PRIVATE: '0xC3d390628D8d7080197cA6a79a7ABa0430229C37', //FantomNFTFactoryPrivate
  TESTNET_721_PUBLIC: '0xA7dacD023F5d5e827cEC42255EA859A1544269Af', //FantomNFTFactory
  MAINNET_1155_PRIVATE: '0x736Eae40AdFf88570b92378c97a0D11b44E1C953', //FantomArtFactoryPrivate
  MAINNET_1155_PUBLIC: '0x520DaB621f93F59d3557174280AB1B6d4FB8c956', //FantomArtFactory
  TESTNET_1155_PRIVATE: '0x8637DBB197768e8Ad0E5cc98f738B64C10452F72', //FantomArtFactoryPrivate
  TESTNET_1155_PUBLIC: '0x864Acb6d06E24486730138245da3A612b74c1Ddf', //FantomArtFactory
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
