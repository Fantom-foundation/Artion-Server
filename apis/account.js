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

const jwt = require("jsonwebtoken");
const jwt_secret = process.env.JWT_SECRET;

const toLowerCase = require("../utils/utils");

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
  address = toLowerCase(address);
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
