require("dotenv").config();
const jwt = require("jsonwebtoken");
const jwt_secret = process.env.JWT_SECRET;
const router = require("express").Router();
const ethers = require("ethers");
const toLowerCase = require("../utils/utils");

router.post("/getToken", (req, res) => {
  let address = req.body.address;
  let isAddress = ethers.utils.isAddress(address);
  if (!isAddress)
    return res.json({
      status: "failed",
      token: "",
    });
  address = toLowerCase(address);
  let token = jwt.sign(
    {
      data: address,
    },
    jwt_secret,
    { expiresIn: "24h" }
  );
  return res.json({
    status: "success",
    token: token,
  });
});

module.exports = router;
