const router = require("express").Router();
const mongoose = require("mongoose");

const auth = require("./middleware/auth");
const Bundle = mongoose.model("Bundle");

router.post("/additemstobundle", auth, async (req, res) => {
  let bundleID = req.body.bundleID;
  let _tokenIDs = req.body.tokenID;
  let tokenIDs = _tokenIDs.split(",");

  let bundle = await Bundle.find(bundleID);
  if (!bundle) {
    return res.status(400).json({
      status: "failed",
    });
  }
  let oldTokens = bundle.tokens;
  let newTokens = new Array();
  oldTokens.map((token) => {
    newTokens.push(token);
  });
  tokenIDs.map((token) => {
    token;
  });
  bundle.tokens = newTokens;
  let newBundle = await bundle.save();
  console.log("new bundle is ", newBundle);
  return res.json({
    status: "success",
    data: newBundle.toBundleJson(),
  });
});

router.post("/removeItemsFromBundle", auth, async (req, res) => {
  let bundleID = req.body.bundleID;
  let _tokenIDs = req.body.tokenID;
  let tokenIDs = _tokenIDs.split(",");
  let bundle = await Bundle.find(bundleID);
  if (!bundle) {
    return res.status(400).json({
      status: "failed",
    });
  }
  let oldTokens = bundle.tokens;
  let newTokens = new Array();
  oldTokens.map((token) => {
    if (tokenIDs.indexOf(token) >= 0) newTokens.push(token);
  });
  bundle.tokens = oldTokens;
  let newBundle = await bundle.save();
  console.log("new bundle is ", newBundle);
  return res.json({
    status: "success",
    data: newBundle.toBundleJson(),
  });
});

module.exports = router;
