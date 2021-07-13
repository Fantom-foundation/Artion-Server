const router = require("express").Router();
const auth = require("./middleware/auth");
const mongoose = require("mongoose");

const toLowerCase = require("../utils/utils");

router.post("/new", auth, async (req, res) => {});

module.exports = router;
