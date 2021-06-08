const mongoose = require("mongoose");
const router = require("express").Router();
const auth = require("./middleware/auth");

const TradeHistory = mongoose.model("TradeHistory");
const Account = mongoose.model("Account");

router.post("/getTradeHistory", async (req, res) => {
  let collectionAddress = req.body.contractAddress;
  let tokenID = req.body.tokenID;

  let _history = await TradeHistory.find({
    collectionAddress: { $regex: new RegExp(collectionAddress, "i") },
    tokenID: tokenID,
  })
    .select([
      "from",
      "to",
      "tokenID",
      "price",
      "value",
      "saleDate",
      "isAuction",
    ])
    .sort({ saleDate: "desc" });
  let history = [];

  let promise = _history.map(async (hist) => {
    let sender = await getAccountInfo(hist.from);
    let receiver = await getAccountInfo(hist.to);
    history.push({
      from: hist.from,
      to: hist.to,
      tokenID: hist.tokenID,
      price: hist.price,
      value: hist.value,
      createdAt: hist.saleDate,
      isAuction: hist.isAuction,
      fromAlias: sender ? sender[0] : null,
      fromImage: sender ? sender[1] : null,
      toAlias: receiver ? receiver[0] : null,
      toImage: receiver ? receiver[1] : null,
    });
  });
  await Promise.all(promise);
  return res.send({
    status: "success",
    data: history,
  });
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

module.exports = router;
