require("dotenv").config();
const router = require("express").Router();
const ethers = require("ethers");

const mongoose = require("mongoose");
const PayToken = mongoose.model("PayToken");

const toLowerCase = require("../utils/utils");
const admin_auth = require("./middleware/auth.admin");
const extractAddress = require("../services/address.utils");
const validateSignature = require("../apis/middleware/auth.sign");

const PaytokenRegistryABI = require("../constants/paytokenRegistry_abi");
let network = process.env.RUNTIME;

// to sign txs
const provider = new ethers.providers.JsonRpcProvider(
  process.env.NETWORK_RPC,
  parseInt(process.env.NETWORK_CHAINID)
);
const ownerWallet = new ethers.Wallet(process.env.ROYALTY_PK, provider);
const registrySC = new ethers.Contract(
  network
    ? PaytokenRegistryABI.address.testnet
    : PaytokenRegistryABI.address.mainnet,
  PaytokenRegistryABI.abi,
  ownerWallet
);
const { getSymbol, getName } = require("../services/price.feed");

router.post("/addNewToken", admin_auth, async (req, res) => {
  try {
    let address = extractAddress(req, res);
    let signature = req.body.signature;
    let retrievedAddr = toLowerCase(req.body.retrievedAddr);
    // verify if signature is valid
    let isValidsignature = await validateSignature(
      address,
      signature,
      retrievedAddr
    );
    if (!isValidsignature)
      return res.status(400).json({
        status: "invalid signature",
      });
    // now get params
    let payTokenAddress = toLowerCase(req.body.payToken);
    let proxyAddress = toLowerCase(req.body.chainlinkProxy);
    let priceDecimals = parseInt(req.body.decimals);
    if (
      !ethers.utils.isAddress(payTokenAddress) ||
      !ethers.utils.isAddress(proxyAddress)
    )
      return res.json({
        status: "failed",
        data: "Invalid Address",
      });
    let isMainnet = true;
    if (network) isMainnet = false;
    else isMainnet = true;
    let name = await getName(payTokenAddress);
    let symbol = await getSymbol(payTokenAddress);

    let payToken = await PayToken.findOne({ address: payTokenAddress });
    if (payToken)
      return res.json({
        status: "failed",
        data: "token is already added",
      });
    else {
      try {
        await registrySC.add(payTokenAddress, { gasLimit: 3000000 });
        payToken = new PayToken();
        payToken.name = name;
        payToken.symbol = symbol;
        payToken.address = payTokenAddress;
        payToken.chainlinkProxyAddress = proxyAddress;
        payToken.decimals = priceDecimals;
        payToken.isMainnet = isMainnet;
        await payToken.save();
        return res.json({
          status: "success",
          data: "New Payment Token successfully added",
        });
      } catch (error) {
        return res.json({
          status: "failed",
        });
      }
    }
  } catch (error) {
    console.log("error");
    return res.json({
      status: "failed",
    });
  }
});

module.exports = router;
