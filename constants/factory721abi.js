const CollectionFactoryContract = {
  MAINNET_PRIVATE: "",
  MAINNET_PUBLIC: "",
  TESTNET_PRIVATE: "0x9dA8d9Cc8A7C79e46A3006f55ED98e915b390F5D",
  TESTNET_PUBLIC: "0xa92cBC72eef9254909A3f0eB9E2716eBD28171AE",
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
