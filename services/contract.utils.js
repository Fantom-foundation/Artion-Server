require("dotenv").config();
const ethers = require("ethers");
const mongoose = require("mongoose");
const Category = mongoose.model("Category");

const SimplifiedERC721ABI = require("../constants/simplifiederc721abi");
const SimplifiedERC1155ABI = require("../constants/simplifiederc1155abi");

let contracts = new Map();
let types = new Map();

const loadContractFromAddress = async (address) => {
  let _contract = contracts.get(address);
  if (_contract) {
    let type = types.get(address);
    return [_contract, type];
  }

  let provider = new ethers.providers.JsonRpcProvider(
    process.env.NETWORK_RPC,
    parseInt(process.env.NETWORK_CHAINID)
  );
  let tokenType = await Category.findOne({ minterAddress: address });
  tokenType = tokenType.type;
  if (tokenType == 721) {
    let contract = new ethers.Contract(address, SimplifiedERC721ABI, provider);
    contracts.set(address, contract);
    types.set(address, 721);
    return [contract, 721];
  } else if (tokenType == 1155) {
    let contract = new ethers.Contract(address, SimplifiedERC1155ABI, provider);
    types.set(address, 1155);
    contracts.set(address, contract);
    return [contract, 1155];
  } else {
    return null;
  }
};

const getTokenInfo = async (address, tkID) => {
  let [minter, tokenType] = await contractutils.loadContractFromAddress(
    address
  );
  if (!minter) return null;
  if (tokenType == 721) {
    let uri = await minter.tokenURI(tkID);
    return uri;
  } else if (tokenType == 1155) {
    let uri = await minter.uri(tkID);
    return uri;
  } else return -1;
};

const contractutils = {
  loadContractFromAddress,
  getTokenInfo,
};

module.exports = contractutils;
