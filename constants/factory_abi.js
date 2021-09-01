const CollectionFactoryContract = {
  MAINNET_721_PRIVATE: "0xe8d29976368Fc2d8699797faA7cD3684dFf41810",
  MAINNET_721_PUBLIC: "0x9dA8d9Cc8A7C79e46A3006f55ED98e915b390F5D",
  TESTNET_721_PRIVATE: "0x130138e2e535304Cce3B3B1B638F54402373391d",
  TESTNET_721_PUBLIC: "0xa92cBC72eef9254909A3f0eB9E2716eBD28171AE",
  MAINNET_1155_PRIVATE: "0x8E504d814C0ba86ECD42Ce92273CaFFB3923253B",
  MAINNET_1155_PUBLIC: "0xe25575E99AE02D8C798d63Edd6aeB5C520f1c5b8",
  TESTNET_1155_PRIVATE: "0x130138e2e535304Cce3B3B1B638F54402373391d",
  TESTNET_1155_PUBLIC: "0xa92cBC72eef9254909A3f0eB9E2716eBD28171AE",
  ABI: [
    {
      inputs: [{ internalType: "address", name: "", type: "address" }],
      name: "exists",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
    },
  ],
};

module.exports = CollectionFactoryContract;
