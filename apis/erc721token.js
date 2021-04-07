const router = require("express").Router();
const mongoose = require("mongoose");
const formidable = require("formidable");

const auth = require("./middleware/auth");
const ERC721TOKEN = mongoose.model("ERC721TOKEN");

const contractutils = require("../services/contract.utils");

const getTokenInfo = async (address, tkID) => {
  let minter = await contractutils.loadContractFromAddress(address);
  if (!minter) return null;
  let uri = await minter.tokenURI(tkID);
  return uri;
};

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

router.post("/increaseViews", auth, async (req, res) => {
  let form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        status: "failed",
      });
    } else {
      let contractAddress = fields.contractAddress;
      let tokenID = fields.tokenID;
      let token = ERC721TOKEN.findOne({
        contractAddress: contractAddress,
        tokenID: tokenID,
      });
      token.viewed = token.viewed + 1;
      let _token = await token.save();
      return res.json({
        status: "success",
        data: _token.viewed,
      });
    }
  });
});

router.post("/fetchTokens", auth, async (req, res) => {
  let filters;
  let step = parseInt(req.body.step);
});

router.post("/getTokenURI", async (req, res) => {
  let address = req.body.address;
  let tokenID = req.body.tokenID;
  let uri = await getTokenInfo(address, tokenID);
  return res.json({
    status: "success",
    data: uri,
  });
});

module.exports = router;
