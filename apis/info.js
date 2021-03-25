const router = require("express").Router();
const mongoose = require("mongoose");
const ERC721TOKEN = mongoose.model("ERC721TOKEN");

// list the newly minted 10 tokens
router.get("/getNewestTokens", async (req, res, next) => {
  let tokens = await ERC721TOKEN.find().sort({ createdAt: 1 }).limit(10);
  console.log("result is ", result);
  return res.json({
    status: "success",
    data: result,
  });
});

module.exports = router;
