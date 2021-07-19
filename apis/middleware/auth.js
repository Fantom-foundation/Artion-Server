require("dotenv").config();
const jwt = require("jsonwebtoken");
const ethUtil = require("ethereumjs-util");
const sigUtil = require("eth-sig-util");
const mongoose = require("mongoose");
const Account = mongoose.model("Account");

const jwt_secret = process.env.JWT_SECRET;

const extractAddress = require("../../services/address.utils");

const auth = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    const publicKey = extractAddress(req, res);

    if (token == null)
      return res.status(401).json({
        status: "failed",
        data: "auth token not provided",
      });

    jwt.verify(token, jwt_secret, (err) => {
      if (err)
        return res.status(400).json({
          status: "failed",
          data: "auth token expired",
        });
      let account = Account.findOne({ address: publicKey });
      let nonce = account.nonce;
      const msg = `sign in to artion account with nonce ${nonce}`;
      const msgBufferHex = ethUtil.bufferToHex(Buffer.from(msg, "utf8"));
      const address = sigUtil.recoverPersonalSignature({
        data: msgBufferHex,
        sig: "",
      });
      next();
    });
  } catch (error) {
    return res.status(400).json({
      status: "failed",
      data: "auth token expired",
    });
  }
};

module.exports = auth;
