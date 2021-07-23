const router = require("express").Router();
const auth = require("./middleware/auth");

router.post("/new", auth, async (req, res) => {});

module.exports = router;
