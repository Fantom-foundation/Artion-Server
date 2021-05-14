const mongoose = require("mongoose");
const router = require("express").Router();
const auth = require("./middleware/auth");

const TradeHistory = mongoose.model("TradeHistory");

router.post("/getTradeHistory", async (req, res) => {
  let erc721address = req.body.contractAddress;
  let tokenID = req.body.tokenID;

  let history = await TradeHistory.find({
    erc721address: { $regex: new RegExp(erc721address, "i") },
    tokenID: tokenID,
  }).select(["from", "to", "tokenID", "price", "saleDate", "isAuction"]);
  return res.send({
    status: "success",
    data: history,
  });
});

module.exports = router;
