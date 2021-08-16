require("dotenv").config();
const ethers = require("ethers");

// price store
const priceStore = new Map();
// decimal store
const decimalStore = new Map();

const toLowerCase = require("../utils/utils");
const MinimalERC20ABI = require("../constants/erc20_mini_abi");
const fMintABI = require("../constants/fmint_abi");
const wFTMAddress = toLowerCase("0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83");
const fMintAddress = toLowerCase("0xBB634cafEf389cDD03bB276c82738726079FcF2E");

const validatorAddress = toLowerCase(process.env.VALIDATORADDRESS);

const paymentTokens = [
  toLowerCase("0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83"), //wftm
  toLowerCase("0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E"), //dai
  toLowerCase("0x04068DA6C83AFCFA0e13ba15A6696662335D5B75"), //usdc
  toLowerCase("0x049d68029688eabf473097a2fc38ef61633a3c7a"), //usdt
];

const provider = new ethers.providers.JsonRpcProvider(
  "https://rpc.ftm.tools",
  250
);
const fMintSC = new ethers.Contract(fMintAddress, fMintABI, provider);

let network = process.env.RUNTIME;

const runPriceFeed = async () => {
  try {
    paymentTokens.map(async (token) => {
      try {
        let price = await fMintSC.getPrice(token);
        price = ethers.utils.formatEther(price);
        priceStore.set(token, price);
      } catch (error) {}
    });
  } catch (error) {
    console.log(error);
  }
  setTimeout(async () => {
    await runPriceFeed();
  }, 1000 * 60 * 5);
};

const getPrice = (address) => {
  address = toLowerCase(address);
  if (
    address == "ftm" ||
    address == "wftm" ||
    address == "fantom" ||
    address == validatorAddress
  )
    address = wFTMAddress;
  let price = priceStore.get(address);
  if (price == null) {
    if (network) price = 1;
    price = 0;
  }
  console.log(address, price);
  return price;
};

const getDecimals = async (address) => {
  address = toLowerCase(address);
  if (
    address == "ftm" ||
    address == "wftm" ||
    address == "fantom" ||
    address == validatorAddress
  )
    address = wFTMAddress;
  let decimal = decimalStore.get(address);
  if (decimal) return decimal;
  let tokenContract = new ethers.Contract(address, MinimalERC20ABI, provider);
  decimal = await tokenContract.decimals();
  decimal = parseInt(decimal.toString());
  decimalStore.set(address, decimal);
  return decimal;
};

const priceFeed = {
  runPriceFeed,
  getPrice,
  getDecimals,
};

module.exports = priceFeed;
