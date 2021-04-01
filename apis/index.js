const router = require("express").Router();

router.use("/auth", require("./auth"));
router.use("/ipfs", require("./ipfs"));
router.use("/info", require("./info"));
router.use("/erc721token", require("./erc721token"));
router.use("/account", require("./account"));
router.use("/collection", require("./collection"));

module.exports = router;
