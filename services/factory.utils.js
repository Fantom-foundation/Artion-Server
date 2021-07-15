require("dotenv").config();
const ethers = require("ethers");

const CollectionFactoryContract = require("../constants/factory721abi");
const provider = new ethers.providers.JsonRpcProvider(
  process.env.NETWORK_RPC,
  parseInt(process.env.NETWORK_CHAINID)
);

let network = process.env.RUNTIME;

const loadContract = async (isPrivate) => {
  let address;
  if (network)
    address = isPrivate
      ? CollectionFactoryContract.TESTNET_PRIVATE
      : CollectionFactoryContract.TESTNET_PUBLIC;
  else
    address = isPrivate
      ? CollectionFactoryContract.MAINNET_PRIVATE
      : CollectionFactoryContract.MAINNET_PUBLIC;
  return new ethers.Contract(address, CollectionFactoryContract.ABI, provider);
};

const isInternalCollection = async (address) => {
  let private_sc = await loadContract(true);
  let public_sc = await loadContract(false);
  let isPrivate = await private_sc.exists(address);
  let isPublic = await public_sc.exists(address);
  return [isPrivate || isPublic, isPublic];
};

const FactoryUtils = {
  loadContract,
  isInternalCollection,
};

module.exports = FactoryUtils;
