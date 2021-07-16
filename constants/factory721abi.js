const CollectionFactoryContract = {
  MAINNET_PRIVATE: "0x2cf00c79861f91cCD431f59A58bd1c51509B76E5",
  MAINNET_PUBLIC: "0x59A0E2921895e2C6c0B33d8b8a99f6f5727f88e3",
  TESTNET_PRIVATE: "0x130138e2e535304Cce3B3B1B638F54402373391d",
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
