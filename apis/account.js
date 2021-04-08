require("dotenv").config();
const fs = require("fs");
const formidable = require("formidable");
const router = require("express").Router();
const mongoose = require("mongoose");

const auth = require("./middleware/auth");
const Account = mongoose.model("Account");

const pinataSDK = require("@pinata/sdk");
const pinata = pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_SECRET_API_KEY
);

const uploadPath = "/home/jason/nft-marketplace/nifty-server/uploads/";
// const uploadPath = "uploads/";

const pinAccountAvatar = async (account, imgData, userName, address, res) => {
  // check wether the account is new or already existing one -> unpin the file
  if (account) {
    let hash = account.imageHash;
    await pinata.unpin(hash);
  }
  let extension = imgData.substring(
    "data:image/".length,
    imgData.indexOf(";base64")
  );
  let fileName = `${userName}~${address}.${extension}`;
  let base64Data = imgData.replace(`^data:image\/${extension};base64,`, "");
  await fs.writeFile(uploadPath + fileName, base64Data, "base64", (err) => {
    return res.status(400).json({
      status: "failed to save an image",
    });
  });

  const pinataOptions = {
    pinataMetadata: {
      address: address,
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
    console.log(error);
    return res.status(400).json({
      status: "failed to save an image",
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
      });
    }
    let address = req.body.address;
    let alias = req.body.alias;
    let email = req.body.email;
    let bio = req.body.bio;
    let imgData = req.body.imgData;

    let account = await Account.findOne({ address: address });
    let ipfsHash = pinAccountAvatar(account, imgData, alias, address, res);
    if (account) {
      account.address = address;
      account.alias = alias;
      account.email = email;
      account.bio = bio;
      account.imageHash = ipfsHash;
      let _account = await account.save();
      return res.json({
        status: "success",
        data: _account,
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
        data: _account,
      });
    }
  });
});

// get account info by address

router.post("/getaccountinfo", auth, async (req, res) => {
  let address = req.body.address;
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

module.exports = router;
