require("dotenv").config();
const router = require("express").Router();

const mongoose = require("mongoose");
const SiteLock = mongoose.model("SiteLock");

const auth = require("./middleware/auth");
const admin_auth = require("./middleware/auth.admin");
const validateSignature = require("../apis/middleware/auth.sign");
const toLowerCase = require("../utils/utils");
const extractAddress = require("../services/address.utils");

router.get("/isSiteLocked", async (req, res) => {
  try {
    let lock = await SiteLock.findOne();
    let isLocked = lock.isLocked;
    let lockTime = lock.lockTime;
    return res.json({
      status: "success",
      data: {
        lockTime,
        isLocked,
      },
    });
  } catch (error) {
    return res.json({
      status: "failed",
      data: {
        lockTime: 0,
        isLocked: false,
      },
    });
  }
});

router.get("/lock/:lockTime", admin_auth, async (req, res) => {
  try {
    let lockTime = parseFloat(req.params.lockTime);
    let lock = await SiteLock.findOne();
    lock.isLocked = true;
    lock.lockTime = lockTime;
    await lock.save();
    return res.json({
      status: "success",
      data: true,
    });
  } catch (error) {
    return res.json({
      status: "failed",
      data: false,
    });
  }
});

router.get("/unlock", admin_auth, async (req, res) => {
  try {
    let lock = await SiteLock.findOne();
    lock.isLocked = false;
    lock.lockTime = 0;
    await lock.save();
    return res.json({
      status: "success",
      data: true,
    });
  } catch (error) {
    return res.json({
      status: "failed",
      data: false,
    });
  }
});

module.exports = router;
