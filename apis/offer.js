const router = require("express").Router();
const auth = require("./middleware/auth");
const mongoose = require("mongoose");

const Offer = mongoose.model("Offer");

const toLowerCase = require("../utils/utils");

router.post("/getOffers", async (req, res) => {
  let nft = req.body.contractAddress;
  nft = toLowerCase(nft);
  let tokenID = parseInt(req.body.tokenID);
  console.log(nft, tokenID);

  try {
    let offers = await Offer.find({
      minter: { $regex: new RegExp(nft, "i") },
      tokenID: tokenID,
    });
    console.log("offers");
    console.log(offers);
    return res.json({
      status: "success",
      data: offers,
    });
  } catch (error) {
    return res.json({
      status: "failed",
    });
  }
});

module.exports = router;
