const router = require("express").Router();
const mongoose = require("mongoose");

router.post("/registercollection", async (req, res, next) => {
  let newCollection = new Collection();

  let name = req.body.name;
});
