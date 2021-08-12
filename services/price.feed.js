require("dotenv").config();
const ethers = require("ethers");

// priceStore
const priceStore = new Map();

const toLowerCase = require("../utils/utils");
const fMintABI = [
  "function getPrice(address _token) public view returns (uint256)",
  "function getExtendedPrice(address _token) public view returns (uint256 _price, uint256 _digits)",
];
const wFTMAddress = toLowerCase("0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83");
const fMintAddress = toLowerCase("0xBB634cafEf389cDD03bB276c82738726079FcF2E");

const validatorAddress = toLowerCase(process.env.VALIDATORADDRESS);

const paymentTokens = [
  toLowerCase("0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83"), //wftm
  toLowerCase("0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E"), //dai
  toLowerCase("0x04068DA6C83AFCFA0e13ba15A6696662335D5B75"), //usdc
  toLowerCase("0x049d68029688eabf473097a2fc38ef61633a3c7a"), //usdt
];

const isValidERC20SC = (address) => {
  return ethers.utils.isAddress(address);
};

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
        console.log(token, price);
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
  let price = priceStore.get(price);
  if (price == null) {
    if (network) price = 1;
    price = 0;
  }
  return price;
};

const priceFeed = {
  runPriceFeed,
  getPrice,
};

module.exports = priceFeed;
