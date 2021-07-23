const Web3 = require("web3");
require("dotenv").config();
const validator = require("../utils/index");

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.NETWORK_RPC));
let erc721validator = new validator.ERC721Validator(web3);
let token = "1";

let network = process.env.RUNTIME;

const isvalidERC721 = async (address) => {
  if (network) return true;
  try {
    let isValid = await erc721validator.token(1, address, token);
    if (isValid == true) return true;
    else return false;
  } catch (error) {
    return false;
  }
};

module.exports = isvalidERC721;
