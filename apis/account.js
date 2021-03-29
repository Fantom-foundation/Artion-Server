const router = require("express").Router();
const mongoose = require("mongoose");
const Account = mongoose.model("Account");

// update the account alias or if not registered, create a new account
router.post("/accountdetails", async (req, res, next) => {
  let address = req.body.address;
  let alias = req.body.alias;
  let email = req.body.email;
  let bio = req.body.bio;
  console.log(address, "  ", alias);
  let account = await Account.findOne({ address: address });
  if (account) {
    account.alias = alias;
    account.email = email;
    account.bio = bio;
    let _account = await account.save();
    return res.json({
      status: "success",
      data: _account.toAccountJSON(),
    });
  } else {
    let newAccount = new Account();
    newAccount.address = address;
    newAccount.alias = alias;
    newAccount.email = email;
    newAccount.bio = bio;
    let _newAccount = await newAccount.save();
    return res.json({
      status: "success",
      data: _newAccount.toAccountJSON(),
    });
  }
});

// get account info by address

router.get("/getaccountinfo", async (req, res, next) => {
  let address = req.body.address;
  let account = await Account.findOne({ address: address });
  if (account) {
    return res.json({
      status: "success",
      data: account.toAccountJSON(),
    });
  } else {
    return res.status(400).json({
      status: "failed",
    });
  }
});

module.exports = router;
