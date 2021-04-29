const router = require("express").Router();
const mongoose = require("mongoose");
const formidable = require("formidable");

const auth = require("./middleware/auth");
const ERC721TOKEN = mongoose.model("ERC721TOKEN");
const TransferHistory = mongoose.model("TransferHistory");

const contractutils = require("../services/contract.utils");
const { default: axios } = require("axios");

// save a new token -- returns a json of newly added token
router.post("/savenewtoken", auth, async (req, res) => {
  let form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        status: "failed",
      });
    } else {
      let contractAddress = fields.contractAddress;

      let newToken = new ERC721TOKEN();
      newToken.contractAddress = contractAddress;
      newToken.tokenID = fields.tokenID;
      newToken.tokenURI = fields.jsonHash;
      newToken.symbol = fields.symbol;
      newToken.royalty = fields.royalty;
      newToken.category = fields.category;
      newToken.imageHash = fields.imageHash;
      newToken.jsonHash = fields.jsonHash;
      let now = new Date();
      newToken.createdAt = now;

      let _newToken = await newToken.save();
      return res.send({
        status: "success",
        data: _newToken.toJSON(),
      });
    }
  });
});

//increase the view count -- returns a increased view count

router.post("/increaseViews", async (req, res) => {
  try {
    let contractAddress = req.body.contractAddress;
    let tokenID = req.body.tokenID;
    let token = await ERC721TOKEN.findOne({
      contractAddress: contractAddress,
      tokenID: tokenID,
    });
    token.viewed = token.viewed + 1;
    let _token = await token.save();
    return res.json({
      status: "success",
      data: _token.viewed,
    });
  } catch (error) {
    return res.status(400).json({
      status: "failed",
    });
  }
});

router.post("/fetchTokens", async (req, res) => {
  let transferFilter = {};

  let minter = null;
  let owner = null;

  let step = parseInt(req.body.step);

  try {
    minter = req.body.contractAddress;
  } catch (error) {}
  try {
    owner = req.body.address;
  } catch (error) {}

  if (owner) {
    if (minter) {
      transferFilter = { collectionAddress: { $in: minter }, to: owner };
    } else {
      transferFilter = { to: owner };
    }
  } else {
    if (minter) {
      transferFilter = { collectionAddress: { $in: minter } };
    }
  }

  let allTokens = new Array();

  let transfers = await TransferHistory.find(transferFilter).select([
    "collectionAddress",
    "tokenID",
    "to",
  ]);
  let promises = transfers.map(async (transfer) => {
    let token = await ERC721TOKEN.findOne({
      contractAddress: transfer.collectionAddress,
      tokenID: transfer.tokenID,
    });
    allTokens.push(token);
  });

  await Promise.all(promises);

  let tokens = allTokens.slice(step * 36, (step + 1) * 36);

  return res.json({
    status: "success",
    data: {
      tokens: tokens,
      totalTokenCounts: allTokens.length,
    },
  });
});

router.post("/getTokenURI", async (req, res) => {
  let address = req.body.contractAddress;
  let tokenID = req.body.tokenID;
  let uri = await contractutils.getTokenInfo(address, tokenID);
  let { data } = await axios.get(uri);
  return res.json({
    status: "success",
    data: data,
  });
});

router.post("/fetchTokensFromAddress", async (req, res) => {
  let address = req.body.address;
  let transfers = await TransferHistory.find({ to: address });
  let tokensInAddress = new Array();

  for (let i = 0; i < transfers.length; ++i) {
    let transfer = transfers[i];
    let token = await ERC721TOKEN.findOne({
      contractAddress: transfer.collectionAddress,
      tokenID: transfer.tokenID,
    });
    tokensInAddress.push(token);
  }
  return res.send({
    status: "success",
    data: tokensInAddress,
  });
});

module.exports = router;
