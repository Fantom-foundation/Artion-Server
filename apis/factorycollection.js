require("dotenv").config();
const router = require("express").Router();
const mongoose = require("mongoose");
const FactoryCollection = mongoose.model("FactoryCollection");
const toLowerCase = require("../utils/utils");
const service_auth = require("./middleware/auth.tracker");

router.post("/handleNewCollectionCreation", service_auth, async (req, res) => {
  try {
    let deployer = toLowerCase(req.body.deployer);
    let minter = toLowerCase(req.body.minter);

    let fc = new FactoryCollection();
    fc.deployer = deployer;
    fc.minter = minter;
    await fc.save();
    return res.json({
      status: "success",
    });
  } catch (error) {
    return res.json({
      status: "failed",
    });
  }
});

module.exports = router;
