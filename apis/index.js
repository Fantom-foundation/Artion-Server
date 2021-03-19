const router = require("express").Router();

// router.use("/auth", require("./auth"));
router.use("/ipfs", require("./ipfs"));

module.exports = router;
