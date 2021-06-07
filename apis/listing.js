const router = require("express").Router();
const auth = require("./middleware/auth");
const mongoose = require("mongoose");

const Listing = mongoose.model("Listing");
const Account = mongoose.model("Account");

const toLowerCase = require("../utils/utils");

router.post("/getListings", async (req, res) => {
  try {
    let nft = req.body.contractAddress;
    nft = toLowerCase(nft);
    let tokenID = parseInt(req.body.tokenID);
    let listings = [];

    let _listings = await Listing.find({ minter: nft, tokenID: tokenID });
    let promise = _listings.map(async (list) => {
      let account = await getAccountInfo(list.owner);
      listings.push({
        quantity: list.quantity,
        startTime: list.startTime,
        owner: list.owner,
        minter: list.minter,
        tokenID: list.tokenID,
        price: list.price,
        alias: account ? account[0] : null,
        image: account ? account[1] : null,
      });
    });
    await Promise.all(promise);
    return res.json({
      status: "success",
      data: listings,
    });
  } catch (error) {
    return res.status(400).json({
      status: "failed",
    });
  }
});

const getAccountInfo = async (address) => {
  try {
    let account = await Account.findOne({ address: address });
    if (account) {
      return [account.alias, account.imageHash];
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
};

router.post("", auth, async (req, res) => {});
module.exports = router;
