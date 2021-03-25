const router = require("express").Router();
const mongoose = require("mongoose");
const Account = mongoose.model("Account");

// update the account alias or if not registered, create a new account
router.post("/accountdetails", async (req, res, next) => {
  let address = req.body.address;
  let alias = req.body.alias;
  console.log(address, "  ", alias);
  let account = await Account.findOne({ address: address });
  if (account) {
    account.alias = alias;
    let _account = await account.save();
    return res.json({
      status: "success",
      data: _account.toAccountJSON(),
    });
  } else {
    let newAccount = new Account();
    newAccount.address = address;
    newAccount.alias = alias;
    let _newAccount = await newAccount.save();
    return res.json({
      status: "success",
      data: _newAccount.toAccountJSON(),
    });
  }
});

module.exports = router;
