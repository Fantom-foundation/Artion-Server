const router = require("express").Router();
const mongoose = require("mongoose");
const formidable = require("formidable");

const auth = require("./middleware/auth");
const ERC721TOKEN = mongoose.model("ERC721TOKEN");

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

module.exports = router;
