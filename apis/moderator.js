require("dotenv").config();

const mongoose = require("mongoose");
const Moderator = mongoose.model("Moderator");

const router = require("express").Router();
const auth = require("./middleware/auth");
const toLowerCase = require("../utils/utils");
const extractAddress = require("../services/address.utils");
const validateSignature = require("../apis/middleware/auth.sign");

const ADMINADDRESS = process.env.ADMINADDRESS;

const isAdmin = (msgSender) => {
  return toLowerCase(ADMINADDRESS) == toLowerCase(msgSender);
};

router.post("/add", auth, async (req, res) => {
  try {
    let adminAddress = extractAddress(req, res);
    if (!isAdmin(adminAddress))
      return res.json({
        status: "failed",
        data: "Only Admin can add Mods",
      });
    let modAddress = toLowerCase(req.body.address);
    let modName = req.body.name;
    let signature = req.body.signature;
    let retrievedAddr = req.body.signatureAddress;
    let isValidsignature = validateSignature(
      adminAddress,
      signature,
      retrievedAddr
    );
    if (!isValidsignature)
      return res.status(400).json({
        status: "invalid signature",
      });
    let mod = await Moderator.findOne({ address: modAddress });
    if (mod) {
      return res.json({
        status: "failed",
        data: "Moderator with this address already exists!",
      });
    } else {
      mod = new Moderator();
      mod.address = modAddress;
      mod.name = modName;
      await mod.save();
      return res.json({
        status: "success",
        data: "New Moderator successfully added!",
      });
    }
  } catch (error) {
    return res.json({
      status: "failed",
    });
  }
});

router.post("/remove", auth, async (req, res) => {
  try {
    let adminAddress = extractAddress(req, res);
    if (!isAdmin(adminAddress))
      return res.json({
        status: "failed",
        data: "Only Admin can add Mods",
      });
    let modAddress = toLowerCase(req.body.address);
    let signature = req.body.signature;
    let retrievedAddr = req.body.signatureAddress;
    let isValidsignature = validateSignature(
      adminAddress,
      signature,
      retrievedAddr
    );
    if (!isValidsignature)
      return res.status(400).json({
        status: "invalid signature",
      });
    await Moderator.deleteMany({ address: modAddress });
    return res.json({
      status: "success",
      data: "Successfully removed a moderator",
    });
  } catch (error) {
    return res.json({
      status: "failed",
    });
  }
});

router.get("/isModerator/:address", async (req, res) => {
  try {
    let address = toLowerCase(req.params.address);
    let mod = await Moderator.findOne({ address: address });
    if (mod)
      return res.json({
        status: "success",
        data: true,
      });
    else
      return res.json({
        status: "success",
        data: false,
      });
  } catch (error) {
    return res.json({
      status: "failed",
      data: false,
    });
  }
});

module.exports = router;
