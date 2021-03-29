const router = require("express").Router();
const mongoose = require("mongoose");
const ERC721TOKEN = mongoose.model("ERC721TOKEN");
const ERC721CONTRACT = mongoose.model("ERC721CONTRACT");

// list the newly minted 10 tokens
router.get("/getNewestTokens", async (req, res) => {
  let tokens = await ERC721TOKEN.find().sort({ createdAt: 1 }).limit(10);
  return res.json({
    status: "success",
    data: tokens,
  });
});

router.get("/geterc721contracts", async (req, res) => {
  let all = await ERC721CONTRACT.find({});
  let erc721contracts = new Array();
  all.map((contract) => {
    erc721contracts.push({
      address: contract.address,
      name: contract.name,
      symbol: contract.symbol,
    });
  });
  return res.json({
    status: "success",
    data: erc721contracts,
  });
});

module.exports = router;
