require("dotenv").config();
const axios = require("axios");
const mongoose = require("mongoose");

require("../models/erc721contract");
const ERC721CONTRACT = mongoose.model("ERC721CONTRACT");

const ftmScanApiKey = process.env.FTM_SCAN_API_KEY;
const validatorAddress = process.env.VALIDATORADDRESS;
const limit = 999999999;
const step = 100000000;

const trackerc721 = async (begin, end) => {
  let contracts = new Array();
  let request = `https://api.ftmscan.com/api?module=account&action=tokennfttx&address=${validatorAddress}&startblock=${begin}&endblock=${end}&sort=asc&apikey=${ftmScanApiKey}`;
  let result = await axios.get(request);
  let tnxs = result.data.result;
  if (tnxs) {
    tnxs.map((tnx) => {
      let contractInfo = {
        address: tnx.contractAddress,
        name: tnx.tokenName,
        symbol: tnx.tokenSymbol,
      };
      if (
        !contracts.some((contract) => contract.address == contractInfo.address)
      ) {
        contracts.push(contractInfo);
      }
    });
  }
  contracts.map(async (contract) => {
    let erc721 = await ERC721CONTRACT.findOne({ address: contract.address });
    if (!erc721) {
      let minter = new ERC721CONTRACT();
      minter.address = contract.address;
      minter.name = contract.name;
      minter.symbol = contract.symbol;
      let _minter = await minter.save();
      console.log("new erc721 contract has been found");
      console.log(_minter);
    } else {
      console.log(
        `contract with address of ${contract.address} is already registered`
      );
    }
  });
};

const trackAll = async () => {
  console.log("erc72 tracker has been started");
  let counter = 0;
  setInterval(async () => {
    counter += 1;
    if (counter == 10) counter = 0;
    await trackerc721(limit - step * (counter + 1), limit - step * counter);
  }, 1000);
};

module.exports = trackAll;
