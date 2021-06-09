const router = require("express").Router();

router.use("/auth", require("./auth"));
router.use("/ipfs", require("./ipfs"));
router.use("/info", require("./info"));
router.use("/nftitems", require("./nftitems"));
router.use("/account", require("./account"));
router.use("/collection", require("./collection"));
router.use("/tradehistory", require("./tradehistory"));
router.use("/notifications", require("./notification"));
router.use("/listing", require("./listing"));
router.use("/erc721", require("./erc721"));
router.use("/offer", require("./offer"));
router.use("/ban", require("./ban"));

module.exports = router;
