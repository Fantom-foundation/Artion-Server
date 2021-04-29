const Web3 = require("web3");
const validator = require("../utils/index");

const web3 = new Web3(
  new Web3.providers.HttpProvider("https://rpcapi.fantom.network")
);
let erc721validator = new validator.ERC721Validator(web3);
let token = "1";

const isERC721 = async (address) => {
  try {
    let isValid = await erc721validator.token(1, address, token);
    if (isValid == true) return true;
    else return false;
  } catch (error) {
    return false;
  }
};

const Validator = {
  isERC721,
};

module.exports = Validator;
