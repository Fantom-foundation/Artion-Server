require("dotenv").config();
const axios = require("axios");
const ethers = require("ethers");

const ftmScanApiKey = process.env.FTM_SCAN_API_KEY;

const loadContractABIFromAddress = async (address) => {
  const request = `https://api.ftmscan.com/api?module=contract&action=getabi&address=${address}&apikey=${ftmScanApiKey}`;
  let response = await axios.get(request);
  let data = response.data;

  let status = data.status == "1" && data.message == "OK" ? true : false;

  if (!status) return "";
  let abi = data.result;
  return abi;
};

const loadContractFromAddress = async (address) => {
  let abi = await loadContractABIFromAddress(address);
  if (abi == "") return null;
  let contract = new ethers.Contract(address, abi);
  return contract;
};

loadContractFromAddress("0xe1146b9ac456fcbb60644c36fd3f868a9072fc6e");
