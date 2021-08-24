require("dotenv").config();
const router = require("express").Router();
const ethers = require("ethers");
const auth = require("./middleware/auth");
const toLowerCase = require("../utils/utils");
const extractAddress = require("../services/address.utils");

const mongoose = require("mongoose");
const Follow = mongoose.model("Follow");
const Account = mongoose.model("Account");

router.post("/isFollowing", async (req, res) => {
  let from = toLowerCase(req.body.from);
  let to = toLowerCase(req.body.to);
  if (!ethers.utils.isAddress(from))
    return res.json({
      status: "failed",
      data: "Follower Address Invalid",
    });
  if (!ethers.utils.isAddress(to))
    return res.json({
      status: "failed",
      data: "Following Address Invalid",
    });
  let follow = await Follow.findOne({
    from: from,
    to: to,
  });
  if (follow) {
    return res.json({
      status: "success",
      data: true,
    });
  } else
    return res.json({
      status: "success",
      data: false,
    });
});

router.post("/update", auth, async (req, res) => {
  try {
    let from = extractAddress(req, res);
    let to = toLowerCase(req.body.follower);
    // cannot follow himself
    if (from == to)
      return res.json({
        status: "failed",
        data: "self address",
      });

    //  both addresses need to be valid
    let isAddressValid = ethers.utils.isAddress(from);
    let isFollowerValid = ethers.utils.isAddress(to);
    if (!isAddressValid || !isFollowerValid)
      return res.json({
        status: "failed",
        data: "invalid personal account address",
      });

    //   now need to validate the signed message

    // if everything is ok, see whether already following or not
    let toFollow = req.body.status; // 1 : follow, 0 : unfollow
    if (parseInt(toFollow) == 1) {
      let follow = await Follow.findOne({
        from: from,
        to: to,
      });
      if (follow)
        return res.json({
          status: "failed",
          data: "You are already following",
        });
      let _follow = new Follow();
      _follow.from = from;
      _follow.to = to;
      await _follow.save();
      return res.json({
        status: "success",
        data: "You are now following",
      });
    } else {
      await Follow.deleteOne({
        from: from,
        to: to,
      });
      return res.json({
        status: "success",
        data: "successfully unfollowing",
      });
    }
  } catch (error) {
    return res.status(400).json({});
  }
});
router.get("/getFollowings/:address", async (req, res) => {
  try {
    let address = toLowerCase(req.params.address);
    if (!ethers.utils.isAddress(address))
      return res.json({
        status: "failed",
        data: "Invalid frc20 address",
      });
    let followers = await Follow.find({
      from: address,
    });
    let data = [];
    let promise = followers.map(async (follower) => {
      let to = follower.to;
      let account = await Account.findOne({ address: to });
      let followers = await Follow.find({ to: to });
      data.push({
        address: to,
        alias: account ? account.alias : null,
        imageHash: account ? account.imageHash : null,
        followers: followers.length,
      });
    });
    await Promise.all(promise);
    return res.json({
      status: "success",
      data,
    });
  } catch (error) {
    return res.status(400).json({});
  }
});
router.get("/getFollowers/:address", async (req, res) => {
  try {
    let address = toLowerCase(req.params.address);
    if (!ethers.utils.isAddress(address))
      return res.json({
        status: "failed",
        data: "Invalid frc20 address",
      });
    let followings = await Follow.find({
      to: address,
    });
    let data = [];
    let promise = followings.map(async (following) => {
      let from = following.from;
      let account = await Account.findOne({ address: from });
      let followers = await Follow.find({ to: from });
      data.push({
        address: from,
        alias: account ? account.alias : null,
        imageHash: account ? account.imageHash : null,
        followers: followers.length,
      });
    });
    await Promise.all(promise);
    return res.json({
      status: "success",
      data,
    });
  } catch (error) {
    return res.status(400).json({});
  }
});

module.exports = router;
