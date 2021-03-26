const router = require("express").Router();
const mongoose = require("mongoose");
const ERC721TOKEN = mongoose.model("ERC721TOKEN");

// save a new token -- returns a json of newly added token
router.post("/savenewtoken", async (req, res, next) => {
  let newToken = new ERC721TOKEN();

  newToken.contractAddress = req.body.contractAddress;
  newToken.tokenID = req.body.tokenID;
  newToken.symbol = req.body.symbol;
  newToken.royalty = req.body.royalty;
  newToken.category = req.body.category;
  newToken.imageHash = req.body.imageHash;
  newToken.jsonHash = req.body.jsonHash;

  let _newToken = await newToken.save();
  return res.json({
    status: "success",
    data: _newToken.toERC721TOKENJson(),
  });
});

//increase the view count -- returns a increased view count

router.post("/increaseViews", async (req, res, next) => {
  let contractAddress = req.body.contractAddress;
  let tokenID = req.body.tokenID;
  let tokens = ERC721TOKEN.find({
    contractAddress: contractAddress,
    tokenID: tokenID,
  });
  let token = tokens[0];
  token.viewed = token.viewed + 1;
  let _token = await token.save();
  return res.json({
    status: "success",
    data: _token.viewed,
  });
});

module.exports = router;
