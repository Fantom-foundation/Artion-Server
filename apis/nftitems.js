const router = require("express").Router();
const mongoose = require("mongoose");

const ERC721TOKEN = mongoose.model("ERC721TOKEN");
const ERC1155TOKEN = mongoose.model("ERC1155TOKEN");
const Category = mongoose.model("Category");

const contractutils = require("../services/contract.utils");

router.post("/increaseViews", async (req, res) => {
  try {
    let contractAddress = req.body.contractAddress;
    let tokenID = req.body.tokenID;
    let tokenType = await Category.findOne({
      minterAddress: contractAddress,
    });
    tokenType = tokenType.type;
    if (tokenType == 721) {
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
    } else if (tokenType == 1155) {
      let token = await ERC1155TOKEN.findOne({
        contractAddress: contractAddress,
        tokenID: tokenID,
      });
      token.viewed = token.viewed + 1;
      let _token = await token.save();
      return res.json({
        status: "success",
        data: _token.viewed,
      });
    } else {
      return res.status(400).json({
        status: "failed",
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: "failed",
    });
  }
});

router.post("/getTokenURI", async (req, res) => {
  try {
    let address = req.body.contractAddress;
    let tokenID = req.body.tokenID;
    let uri = await contractutils.getTokenInfo(address, tokenID);
    return res.json({
      status: "success",
      data: uri,
    });
  } catch (error) {
    return res.status(400).json({
      status: "failed",
      data: "token id out of total balance",
    });
  }
});

router.post("/fetchTokens", async (req, res) => {
  let transferFilter = {};
  let step = parseInt(req.body.step);
  let minter = null;
  let owner = null;

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

  let tokens = (await ERC721TOKEN.find()).slice(step * 36, (step + 1) * 36);
  return res.json({
    status: "success",
    data: {
      tokens: tokens,
      totalTokenCounts: tokens.length,
    },
  });
});

module.exports = router;
