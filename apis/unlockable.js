require("dotenv").config();
const router = require("express").Router();

const mongoose = require("mongoose");
const UnlockableContents = mongoose.model("UnlockableContents");

const auth = require("./middleware/auth");
const toLowerCase = require("../utils/utils");
const extractAddress = require("../services/address.utils");
const validateSignature = require("../apis/middleware/auth.sign");

router.post("/addUnlockableContent", auth, async (req, res) => {
  try {
    let address = extractAddress(req, res);
    let contractAddress = toLowerCase(req.body.contractAddress);
    let tokenID = parseInt(req.body.tokenID);
    let retrievedAddr = toLowerCase(req.body.signatureAddress);
    let signature = req.body.signature;
    let content = req.body.content;
    let isValidsignature = await validateSignature(
      address,
      signature,
      retrievedAddr
    );
    if (!isValidsignature)
      return res.status(400).json({
        status: "invalid signature",
      });

    let unlockable = new UnlockableContents();
    unlockable.contractAddress = contractAddress;
    unlockable.tokenID = tokenID;
    unlockable.content = content;
    try {
      await unlockable.save();
      return res.json({
        status: "success",
      });
    } catch (error) {
      return res.json({
        status: "failed",
        data: "This Item already has an unlockable content.",
      });
    }
  } catch (error) {
    return res.json({
      status: "failed",
    });
  }
});

router.post("/retrieveUnlockableContent", auth, async (req, res) => {
  try {
    let address = extractAddress(req, res);
    let contractAddress = toLowerCase(req.body.contractAddress);
    let tokenID = parseInt(req.body.tokenID);
    let retrievedAddr = toLowerCase(req.body.signatureAddress);
    let signature = req.body.signature;
    let isValidsignature = await validateSignature(
      address,
      signature,
      retrievedAddr
    );
    if (!isValidsignature)
      return res.status(400).json({
        status: "invalid signature",
      });
    let unlockable = await UnlockableContents.findOne({
      contractAddress,
      tokenID,
    });
    if (unlockable)
      return res.json({
        status: "success",
        data: unlockable.content,
      });
    else
      return res.json({
        status: "failed",
        data: "This item doesn't have unlockable content.",
      });
  } catch (error) {
    return res.json({
      status: "failed",
    });
  }
});

module.exports = router;
