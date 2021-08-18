require("dotenv").config();
const fs = require("fs");
const formidable = require("formidable");
const router = require("express").Router();
const ethers = require("ethers");
const mongoose = require("mongoose");

const auth = require("./middleware/auth");
const Account = mongoose.model("Account");
const Follow = mongoose.model("Follow");
const NotificationSetting = mongoose.model("NotificationSetting");

const validateSignature = require("../apis/middleware/auth.sign");

const pinataSDK = require("@pinata/sdk");
const pinata = pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_SECRET_API_KEY
);

const toLowerCase = require("../utils/utils");

const extractAddress = require("../services/address.utils");

const uploadPath = process.env.UPLOAD_PATH;

const pinAccountAvatar = async (account, imgData, userName, address, res) => {
  // check wether the account is new or already existing one -> unpin the file
  address = toLowerCase(address);
  if (account) {
    let hash = account.imageHash;
    try {
      await pinata.unpin(hash);
    } catch (error) {}
  }
  let extension = imgData.substring(
    "data:image/".length,
    imgData.indexOf(";base64")
  );
  let fileName = `${userName}${address}.${extension}`;
  let base64Data = imgData.replace(`data:image\/${extension};base64,`, "");
  fs.writeFile(uploadPath + fileName, base64Data, "base64", (err) => {
    if (err) {
      return res.status(400).json({
        status: "failed to save an image 1",
      });
    }
  });

  const pinataOptions = {
    pinataMetadata: {
      name: userName + address + "avatar",
      keyvalues: {
        address: address,
        userName: userName,
      },
    },
    pinataOptions: {
      cidVersion: 0,
    },
  };
  const readableStreamForFile = fs.createReadStream(uploadPath + fileName);
  try {
    let result = await pinata.pinFileToIPFS(
      readableStreamForFile,
      pinataOptions
    );
    // remove file once pinned
    try {
      fs.unlinkSync(uploadPath + fileName);
    } catch (error) {}
    return result.IpfsHash;
  } catch (error) {
    return res.status(400).json({
      status: "failed to save an image 2",
    });
  }
};

// update the account alias or if not registered, create a new account
router.post("/accountdetails", auth, async (req, res) => {
  let form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        status: "failed",
        data: 0,
      });
    }
    let address = extractAddress(req, res);
    let alias = fields.alias;
    let email = fields.email;
    let bio = fields.bio;
    let imgData = fields.imgData;
    let signature = fields.signature;
    let retrievedAddr = fields.signatureAddress;
    let isValidsignature = await validateSignature(
      address,
      signature,
      retrievedAddr
    );
    if (!isValidsignature)
      return res.status(400).json({
        status: "invalid signature",
      });
    let account = await Account.findOne({ address: address });
    if (imgData) {
      if (imgData.startsWith("https")) {
        if (account) {
          account.alias = alias;
          account.email = email;
          account.bio = bio;
          let _account = await account.save();
          return res.json({
            status: "success",
            data: _account,
          });
        } else {
          return res.status(400).json({
            status: "failed",
            data: 1,
          });
        }
      } else {
        let ipfsHash = await pinAccountAvatar(
          account,
          imgData,
          alias,
          address,
          res
        );
        if (account) {
          account.alias = alias;
          account.email = email;
          account.bio = bio;
          account.imageHash = ipfsHash;
          let _account = await account.save();
          return res.json({
            status: "success",
            data: _account.toAccountJSON(),
          });
        } else {
          let newAccount = new Account();
          newAccount.address = address;
          newAccount.alias = alias;
          newAccount.email = email;
          newAccount.bio = bio;
          newAccount.imageHash = ipfsHash;
          let _account = await newAccount.save();
          return res.json({
            status: "success",
            data: _account.toAccountJSON(),
          });
        }
      }
    } else {
      if (account) {
        account.alias = alias;
        account.email = email;
        account.bio = bio;
        let _account = await account.save();
        return res.json({
          status: "success",
          data: _account.toAccountJSON(),
        });
      } else {
        let account = new Account();
        account.address = address;
        account.alias = alias;
        account.email = email;
        account.bio = bio;
        let _account = await account.save();
        return res.json({
          status: "success",
          data: _account.toAccountJSON(),
        });
      }
    }
  });
});

// get account info by address

router.get("/getaccountinfo", auth, async (req, res) => {
  let address = extractAddress(req);
  let account = await Account.findOne({ address: address });
  if (account) {
    return res.json({
      status: "success",
      data: account.toAccountJSON(),
    });
  } else {
    return res.status(400).json({
      status: "failed",
    });
  }
});

// get account info by address

router.post("/getuseraccountinfo", async (req, res) => {
  let address = req.body.address;
  if (!ethers.utils.isAddress(address))
    return res.json({
      status: "failed",
      data: "invalid frc20 address",
    });
  address = toLowerCase(address);
  let account = await Account.findOne({ address: address });
  let followers = await Follow.find({ to: address });
  let followings = await Follow.find({ from: address });
  if (account) {
    return res.json({
      status: "success",
      data: {
        address: account.address,
        alias: account.alias,
        email: account.email,
        bio: account.bio,
        imageHash: account.imageHash,
        bannerHash: account.bannerHash,
        followers: followers.length,
        followings: followings.length,
      },
    });
  } else {
    return res.json({
      status: "success",
      data: {
        followers: followers.length,
        followings: followings.length,
      },
    });
  }
});

router.get("/nonce/:address", auth, async (req, res) => {
  try {
    let address = toLowerCase(req.params.address);
    if (!ethers.utils.isAddress(address))
      return res.json({
        status: "failed",
        data: "invalid frc20 address",
      });
    let account = await Account.findOne({ address: address });
    if (account) {
      return res.json({
        status: "success",
        data: account.nonce,
      });
    } else {
      let _account = new Account();
      _account.address = address;
      _account.nonce = Math.floor(Math.random() * 9999999);
      let __account = await _account.save();
      return res.json({
        status: "success",
        data: __account.nonce,
      });
    }
  } catch (error) {
    return res.json({
      status: "failed",
    });
  }
});

router.post("/notificationsettings", auth, async (req, res) => {
  try {
    let address = extractAddress(req, res);
    let signature = req.body.signature;
    let retrievedAddr = req.body.signatureAddress;
    let isValidsignature = await validateSignature(
      address,
      signature,
      retrievedAddr
    );
    if (!isValidsignature)
      return res.status(400).json({
        status: "invalid signature",
      });

    // get individual values
    let settings = req.body.settings;
    settings = JSON.parse(settings);
    let fNotification = settings.fNotification;
    let fBundleCreation = settings.fBundleCreation;
    let fBundleList = settings.fBundleList;
    let fBundlePrice = settings.fBundlePrice;
    let fNftAuctionPrice = settings.fNftAuctionPrice;
    let fNftList = settings.fNftList;
    let fNftAuction = settings.fNftAuction;
    let fNftPrice = settings.fNftPrice;

    let sNotification = settings.sNotification;
    let sBundleBuy = settings.sBundleBuy;
    let sBundleSell = settings.sBundleSell;
    let sBundleOffer = settings.sBundleOffer;
    let sBundleOfferCancel = settings.sBundleOfferCancel;
    let sNftAuctionPrice = settings.sNftAuctionPrice;
    let sNftBidToAuction = settings.sNftBidToAuction;
    let sNftBidToAuctionCancel = settings.sNftBidToAuctionCancel;
    let sAuctionWin = settings.sAuctionWin;
    let sAuctionOfBidCancel = settings.sAuctionOfBidCancel;
    let sNftSell = settings.sNftSell;
    let sNftBuy = settings.sNftBuy;
    let sNftOffer = settings.sNftOffer;
    let sNftOfferCancel = settings.sNftOfferCancel;

    let notificationSettings = await NotificationSetting.findOne({
      address: address,
    });
    if (!notificationSettings) notificationSettings = new NotificationSetting();
    notificationSettings.fNotification = fNotification;
    if (fNotification) {
      // need to change individual values
      notificationSettings.fBundleCreation = fBundleCreation;
      notificationSettings.fBundleList = fBundleList;
      notificationSettings.fBundlePrice = fBundlePrice;
      notificationSettings.fNftAuctionPrice = fNftAuctionPrice;
      notificationSettings.fNftList = fNftList;
      notificationSettings.fNftAuction = fNftAuction;
      notificationSettings.fNftPrice = fNftPrice;
    } else {
      notificationSettings.fBundleCreation = false;
      notificationSettings.fBundleList = false;
      notificationSettings.fBundlePrice = false;
      notificationSettings.fNftAuctionPrice = false;
      notificationSettings.fNftList = false;
      notificationSettings.fNftAuction = false;
      notificationSettings.fNftPrice = false;
    }
    notificationSettings.sNotification = sNotification;
    if (sNotification) {
      // need to change individual values
      notificationSettings.sBundleBuy = sBundleBuy;
      notificationSettings.sBundleSell = sBundleSell;
      notificationSettings.sBundleOffer = sBundleOffer;
      notificationSettings.sBundleOfferCancel = sBundleOfferCancel;
      notificationSettings.sNftAuctionPrice = sNftAuctionPrice;
      notificationSettings.sNftBidToAuction = sNftBidToAuction;
      notificationSettings.sNftBidToAuctionCancel = sNftBidToAuctionCancel;
      notificationSettings.sAuctionWin = sAuctionWin;
      notificationSettings.sAuctionOfBidCancel = sAuctionOfBidCancel;
      notificationSettings.sNftSell = sNftSell;
      notificationSettings.sNftBuy = sNftBuy;
      notificationSettings.sNftOffer = sNftOffer;
      notificationSettings.sNftOfferCancel = sNftOfferCancel;
    } else {
      notificationSettings.sBundleBuy = false;
      notificationSettings.sBundleSell = false;
      notificationSettings.sBundleOffer = false;
      notificationSettings.sBundleOfferCancel = false;
      notificationSettings.sNftAuctionPrice = false;
      notificationSettings.sNftBidToAuction = false;
      notificationSettings.sNftBidToAuctionCancel = false;
      notificationSettings.sAuctionWin = false;
      notificationSettings.sAuctionOfBidCancel = false;
      notificationSettings.sNftSell = false;
      notificationSettings.sNftBuy = false;
      notificationSettings.sNftOffer = false;
      notificationSettings.sNftOfferCancel = false;
    }
    await notificationSettings.save();
    return res.json({
      status: "success",
    });
  } catch (error) {
    console.log(error);
    return res.json({
      status: "failed",
    });
  }
});

router.get("/getnotificationsettings", auth, async (req, res) => {
  try {
    let address = extractAddress(req, res);
    let ns = await NotificationSetting.findOne({ address: address });
    return res.json({
      status: "success",
      data: ns,
    });
  } catch (error) {
    return res.json({
      status: "failed",
    });
  }
});

module.exports = router;
