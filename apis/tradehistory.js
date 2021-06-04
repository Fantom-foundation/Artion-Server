const mongoose = require("mongoose");
const router = require("express").Router();
const auth = require("./middleware/auth");

const TradeHistory = mongoose.model("TradeHistory");

router.post("/getTradeHistory", async (req, res) => {
  let collectionAddress = req.body.contractAddress;
  let tokenID = req.body.tokenID;

  let history = await TradeHistory.find({
    collectionAddress: { $regex: new RegExp(collectionAddress, "i") },
    tokenID: tokenID,
  }).select([
    "from",
    "to",
    "tokenID",
    "price",
    "value",
    "createdAt",
    "isAuction",
  ]);
  return res.send({
    status: "success",
    data: history,
  });
});

module.exports = router;
