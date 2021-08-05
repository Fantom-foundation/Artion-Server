require("dotenv").config();

const mongoose = require("mongoose");
const Like = mongoose.model("Like");
const BundleLike = mongoose.model("BundleLike");
const BundleInfo = mongoose.model("BundleInfo");
const Bundle = mongoose.model("Bundle");
const NFTITEM = mongoose.model("NFTITEM");
const Account = mongoose.model("Account");

const router = require("express").Router();
const auth = require("./middleware/auth");
const toLowerCase = require("../utils/utils");
const extractAddress = require("../services/address.utils");
const orderBy = require("lodash.orderby");

const FETCH_COUNT_PER_TIME = 18;

const getBundleItemDetails = async (bundleItem) => {
  try {
    let nftItem = await NFTITEM.findOne({
      contractAddress: bundleItem.contractAddress,
      tokenID: bundleItem.tokenID,
    });
    return {
      imageURL: nftItem.imageURL,
      thumbnailPath: nftItem.thumbnailPath,
    };
  } catch (error) {
    return {};
  }
};

const entailBundleInfoItems = async (bundleInfoItems) => {
  let details = [];
  let promise = bundleInfoItems.map(async (bundleInfoItem) => {
    let detail = await getBundleItemDetails(bundleInfoItem);
    details.push({
      ...bundleInfoItem._doc,
      ...detail,
    });
  });
  await Promise.all(promise);
  return details;
};

router.post("/getPageLiked", async (req, res) => {
  try {
    let address = extractAddress(req, res);
    if (!address)
      return res.json({
        status: "failed",
        data: [],
      });
    let items = req.body.items;
    items = JSON.parse(items);
    let promise = items.map(async (item) => {
      let contractAddress = item.contractAddress;
      if (contractAddress) {
        let tokenID = parseInt(item.tokenID);
        let like = await Like.findOne({
          contractAddress: contractAddress,
          tokenID: tokenID,
          follower: address,
        });
        return {
          contractAddress,
          tokenID,
          isLiked: like ? true : false,
        };
      } else {
        let bundleID = item.bundleID;
        let like = await BundleLike.findOne({
          bundleID: bundleID,
          follower: address,
        });
        return {
          bundleID,
          isLiked: like ? true : false,
        };
      }
    });
    let data = await Promise.all(promise);
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

router.post("/getMyLikes", async (req, res) => {
  try {
    let address = toLowerCase(req.body.address);
    let step = parseInt(req.body.step);
    // find nfts
    let _nftLikes = await Like.find({ follower: address });
    let nftLikes = _nftLikes.map((_nftLike) => {
      return {
        contractAddress: _nftLike.contractAddress,
        tokenID: _nftLike.tokenID,
      };
    });
    let myLikedNFTs = await NFTITEM.find({ $or: nftLikes }).select([
      "contractAddress",
      "tokenID",
      "tokenURI",
      "tokenType",
      "thumbnailPath",
      "name",
      "imageURL",
      "supply",
      "price",
      "liked",
    ]);
    // find bundles
    let _bundleLikes = await BundleLike.find({ follower: address });
    let bundleLikesIDs = _bundleLikes.map(
      (_bundleLike) => _bundleLike.bundleID
    );
    let _myLikedBundles = await Bundle.find({
      _id: { $in: bundleLikesIDs },
    });
    let bundleInfos = await BundleInfo.find({
      bundleID: { $in: bundleLikesIDs },
    });
    bundleInfos = await entailBundleInfoItems(bundleInfos);
    let myLikedBundles = [];
    _myLikedBundles.map((bundle) => {
      let bundleItems = bundleInfos.filter(
        (bundleInfo) => bundleInfo.bundleID == bundle._id
      );
      myLikedBundles.push({
        viewed: bundle._doc.viewed,
        liked: bundle._doc.liked,
        price: bundle._doc.price,
        _id: bundle._doc._id,
        name: bundle._doc.name,
        items: bundleItems,
      });
    });
    let _data = [...myLikedNFTs, ...myLikedBundles];
    _data = orderBy(_data, "liked", "desc");
    let data = _data.slice(
      step * FETCH_COUNT_PER_TIME,
      (step + 1) * FETCH_COUNT_PER_TIME
    );
    return res.json({
      status: "success",
      data: {
        tokens: data,
        total: _data.length,
      },
    });
  } catch (error) {
    return res.json({
      status: "failed",
    });
  }
});

router.post("/update", auth, async (req, res) => {
  try {
    let follower = extractAddress(req, res);
    let type = req.body.type;
    let newLiked = 0;
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
        let _nft = await nft.save();
        newLiked = _nft.liked;
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
        let _nft = await nft.save();
        newLiked = _nft.liked;
      }
      return res.json({
        status: "success",
        data: newLiked,
      });
    } else if (type == "bundle") {
      let bundleID = req.body.bundleID;
      let like = await BundleLike.findOne({
        bundleID: bundleID,
        follower: follower,
      });
      let newLiked = 0;
      if (like) {
        await like.remove();
        let bundle = await Bundle.findById(bundleID);
        bundle.liked = parseInt(bundle.liked) - 1;
        let _bundle = await bundle.save();
        newLiked = _bundle.liked;
      } else {
        let _like = new BundleLike();
        _like.bundleID = bundleID;
        _like.follower = follower;
        await _like.save();
        let bundle = await Bundle.findById(bundleID);
        bundle.liked = parseInt(bundle.liked) + 1;
        let _bundle = await bundle.save();
        newLiked = _bundle.liked;
      }
      return res.json({
        status: "success",
        data: newLiked,
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

router.post("/getLikes", async (req, res) => {
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
