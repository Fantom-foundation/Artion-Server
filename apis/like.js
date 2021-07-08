require("dotenv").config();

const mongoose = require("mongoose");
const Like = mongoose.model("Like");
const BundleLike = mongoose.model("BundleLike");
const Bundle = mongoose.model("Bundle");
const NFTITEM = mongoose.model("NFTITEM");
const Account = mongoose.model("Account");

const router = require("express").Router();
const auth = require("./middleware/auth");
const toLowerCase = require("../utils/utils");
const extractAddress = require("../services/address.utils");
const e = require("express");

router.post("/isLiked", async (req, res) => {
  try {
    let type = req.body.type;
    let follower = toLowerCase(req.body.follower);
    if (type == "nft") {
      let contractAddress = toLowerCase(req.body.contractAddress);
      let tokenID = parseInt(req.body.tokenID);

      let like = await Like.findOne({
        contractAddress: contractAddress,
        tokenID: tokenID,
        follower: follower,
      });
      if (like)
        return res.json({
          status: "success",
          data: true,
        });
      else
        return res.json({
          status: "success",
          data: false,
        });
    } else if (type == "bundle") {
      let bundleID = req.body.bundleID;
      let like = await BundleLike.findOne({
        bundleID: bundleID,
        follower: follower,
      });
      if (like)
        return res.json({
          status: "success",
          data: true,
        });
      else
        return res.json({
          status: "success",
          data: false,
        });
    } else {
      return res.json({
        status: "success",
        data: false,
      });
    }
  } catch (error) {
    return res.json({
      status: "success",
      data: false,
    });
  }
});

router.post("/update", auth, async (req, res) => {
  try {
    let follower = extractAddress(req, res);
    let type = req.body.type;
    if (type == "nft") {
      let contractAddress = toLowerCase(req.body.contractAddress);
      let tokenID = parseInt(req.body.tokenID);

      // check if following
      let like = await Like.findOne({
        contractAddress: contractAddress,
        tokenID: tokenID,
        follower: follower,
      });

      if (like) {
        await like.remove();
        let nft = await NFTITEM.findOne({
          contractAddress: contractAddress,
          tokenID: tokenID,
        });
        nft.liked = parseInt(nft.liked) - 1;
        await nft.save();
      } else {
        let _like = new Like();
        _like.contractAddress = contractAddress;
        _like.follower = follower;
        _like.tokenID = tokenID;
        await _like.save();
        let nft = await NFTITEM.findOne({
          contractAddress: contractAddress,
          tokenID: tokenID,
        });
        nft.liked = parseInt(nft.liked) + 1;
        await nft.save();
      }
      return res.json({
        status: "success",
        data: true,
      });
    } else if (type == "bundle") {
      let bundleID = req.body.bundleID;
      let like = await BundleLike.findOne({
        bundleID: bundleID,
        follower: follower,
      });
      if (like) {
        await like.remove();
        let bundle = await Bundle.findById(bundleID);
        bundle.liked = parseInt(bundle.liked) - 1;
        await bundle.save();
      } else {
        let _like = new BundleLike();
        _like.bundleID = bundleID;
        _like.follower = follower;
        await _like.save();
        let bundle = await Bundle.findById(bundleID);
        bundle.liked = parseInt(bundle.liked) + 1;
        await bundle.save();
      }
      return res.json({
        status: "success",
        data: true,
      });
    } else
      return res.json({
        status: "failed",
        data: false,
      });
  } catch (error) {
    return res.json({
      status: "failed",
      data: false,
    });
  }
});

router.post("/getLikes/", async (req, res) => {
  try {
    let type = req.body.type;
    let likes = [];
    if (type == "nft") {
      let contractAddress = toLowerCase(req.body.contractAddress);
      let tokenID = parseInt(req.body.tokenID);
      likes = await Like.find({
        contractAddress: contractAddress,
        tokenID: tokenID,
      });
    } else if (type == "bundle") {
      let bundleID = req.body.bundleID;
      likes = await BundleLike.find({
        bundleID: bundleID,
      });
    }
    let data = [];
    let promise = likes.map(async (like) => {
      let address = like.follower;
      let account = await Account.findOne({ address: address });
      if (account) {
        data.push({
          address: address,
          alias: account.alias,
          imageHash: account.imageHash,
        });
      } else {
        data.push({
          address: address,
        });
      }
    });
    await Promise.all(promise);
    return res.json({
      status: "success",
      data: data,
    });
  } catch (error) {
    return res.json({
      status: "failed",
      data: [],
    });
  }
});

module.exports = router;
