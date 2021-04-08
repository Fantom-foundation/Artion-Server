require("dotenv").config();
const mongoose = require("mongoose");
const axios = require("axios");
const ethers = require("ethers");

const ftmScanApiKey = process.env.FTM_SCAN_API_KEY;

require("../models/abi");
const ABI = mongoose.model("ABI");

const loadContractABIFromAddress = async (address) => {
  let abi = await ABI.findOne({ address: address });
  console.log("abi is ", abi);
  if (abi) return abi.abi;
  else {
    const request = `https://api.ftmscan.com/api?module=contract&action=getabi&address=${address}&apikey=${ftmScanApiKey}`;
    let response = await axios.get(request);
    let data = response.data;

    let status = data.status == "1" && data.message == "OK" ? true : false;

    if (!status) return "";
    let abi = data.result;
    let newABI = new ABI();
    newABI.address = address;
    newABI.abi = abi;
    await newABI.save();
    return abi;
  }
};

const loadContractFromAddress = async (address) => {
  let abi = await loadContractABIFromAddress(address);
  if (!abi) return null;
  let provider = new ethers.providers.JsonRpcProvider(
    "https://rpc.fantom.network",
    250
  );

  let contract = new ethers.Contract(address, abi, provider);
  return contract;
};

const getTokenInfo = async (address, tkID) => {
  let minter = await contractutils.loadContractFromAddress(address);
  if (!minter) return null;
  let uri = await minter.tokenURI(tkID);
  return uri;
};

const contractutils = {
  loadContractFromAddress,
  getTokenInfo,
};

module.exports = contractutils;
