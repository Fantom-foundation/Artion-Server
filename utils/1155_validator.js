require("dotenv").config();
const ethers = require("ethers");

const ERC1155InterfaceID = require("../constants/1155_interfaceID_abi");

const provider = new ethers.providers.JsonRpcProvider(
  process.env.NETWORK_RPC,
  parseInt(process.env.NETWORK_CHAINID)
);

const INTERFACEID = 0xd9b67a26;

const isValidERC1155 = async (contractAddress) => {
  try {
    let testContract = new ethers.Contract(
      contractAddress,
      ERC1155InterfaceID.ABI,
      provider
    );
    let is1155 = await testContract.supportsInterface(INTERFACEID);
    return is1155;
  } catch (error) {
    return false;
  }
};

module.exports = isValidERC1155;
