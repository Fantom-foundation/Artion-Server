const mongoose = require("mongoose");
const router = require("express").Router();
const auth = require("./middleware/auth");

const TradeHistory = mongoose.model("TradeHistory");

router.post("/getTradeHistory", auth, async (req, res) => {
  let erc721address = req.body.erc721address;
  let tokenID = req.body.tokenID;

  let history = TradeHistory.find({
    erc721address: erc721address,
    tokenID: tokenID,
  });
  return res.send({
    status: "success",
    data: history,
  });
});

module.exports = router;
