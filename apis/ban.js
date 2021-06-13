require("dotenv").config();
const jwt = require("jsonwebtoken");
const jwt_secret = process.env.JWT_SECRET;
const router = require("express").Router();

const mongoose = require("mongoose");

const BannedUser = mongoose.model("BannedUser");
const BannedNFT = mongoose.model("BannedNFT");
const ERC721CONTRACT = mongoose.model("ERC721CONTRACT");
const NFTITEM = mongoose.model("NFTITEM");
const ERC1155HOLDING = mongoose.model("ERC1155HOLDING");

const auth = require("./middleware/auth");
const contractutils = require("../services/contract.utils");
const toLowerCase = require("../utils/utils");

const adminAddress = "0xB7bC6D2666e73F8Cd143a929DB5404e2fc03eA89";

const extractAddress = (req, res) => {
  let authorization = req.headers.authorization.split(" ")[1],
    decoded;
  try {
    decoded = jwt.verify(authorization, jwt_secret);
  } catch (e) {
    return res.status(401).send("unauthorized");
  }
  let address = decoded.data;
  address = toLowerCase(address);
  return address;
};

const isAdmin = (msgSender) => {
  return toLowerCase(adminAddress) == toLowerCase(msgSender);
};

router.post("/banUser", auth, async (req, res) => {
  try {
    let adminAddress = extractAddress(req, res);
    if (isAdmin(adminAddress)) {
      let banAddress = toLowerCase(req.body.address);
      let reason = req.body.reason;
      try {
        let bannedUser = new BannedUser();
        bannedUser.address = banAddress;
        bannedUser.reason = reason ? reason : "";
        await bannedUser.save();
        return res.json({
          status: "success",
          data: "banned",
        });
      } catch (error) {
        return res.json({
          status: "failed",
          data: "user is alread banned",
        });
      }
    } else {
      return res.json({
        status: "failed",
        data: "You are not an admin",
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: "failed",
    });
  }
});

router.post("/banItem", auth, async (req, res) => {
  try {
    let adminAddress = extractAddress(req, res);
    if (isAdmin(adminAddress)) {
      let address = toLowerCase(req.body.address);
      let tokenID = parseInt(req.body.tokenID);
      try {
        let bannedNFT = new BannedNFT();
        bannedNFT.contractAddress = address;
        bannedNFT.tokenID = tokenID;
        await bannedNFT.save();
        await NFTITEM.deleteOne({
          contractAddress: address,
          tokenID: tokenID,
        });
        await ERC1155HOLDING.deleteMany({
          contractAddress: address,
          tokenID: tokenID,
        });
        return res.json({
          status: "success",
          data: "banned",
        });
      } catch (error) {
        return res.json({
          status: "failed",
          data: "This Item is already banned",
        });
      }
    } else {
      return res.json({
        status: "failed",
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: "failed",
    });
  }
});

router.post("/boostCollection", auth, async (req, res) => {
  try {
    let adminAddress = extractAddress(req, res);
    if (isAdmin(adminAddress)) {
      let address = toLowerCase(req.body.address);
      try {
        let contract = await ERC721CONTRACT.findOne({
          address: address,
        });
        if (contract) {
          contract.isVerified = true;
          await contract.save();
          return res.json({
            status: "success",
            data: "collection boosted",
          });
        }
      } catch (error) {
        return res.status(400).json({
          status: "failed",
        });
      }
    } else {
      return res.status(400).json({
        status: "failed",
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: "failed",
    });
  }
});

module.exports = router;
