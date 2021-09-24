require("dotenv").config();
const fs = require("fs");
const formidable = require("formidable");
const router = require("express").Router();
const validUrl = require("valid-url");

const mongoose = require("mongoose");
const Bundle = mongoose.model("Bundle");
const Account = mongoose.model("Account");

const auth = require("./middleware/auth");

const pinataSDK = require("@pinata/sdk");

const toLowerCase = require("../utils/utils");

const extractAddress = require("../services/address.utils");

const ipfsUris = ["https://artion.mypinata.cloud/ipfs/", "https://artion1.mypinata.cloud/ipfs/", "https://artion2.mypinata.cloud/ipfs/", "https://artion3.mypinata.cloud/ipfs/", "https://artion4.mypinata.cloud/ipfs/", "https://artion5.mypinata.cloud/ipfs/", "https://artion6.mypinata.cloud/ipfs/", "https://artion7.mypinata.cloud/ipfs/", "https://artion8.mypinata.cloud/ipfs/", "https://artion9.mypinata.cloud/ipfs/", "https://artion10.mypinata.cloud/ipfs/", "https://artion11.mypinata.cloud/ipfs/", "https://artion12.mypinata.cloud/ipfs/", "https://artion13.mypinata.cloud/ipfs/"];

const uploadPath = process.env.UPLOAD_PATH;
const pinata = pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_SECRET_API_KEY
);

// pin image file for NFT creation
const pinFileToIPFS = async (
  fileName,
  address,
  name,
  symbol,
  royalty,
  xtraUrl
) => {
  const options = {
    pinataMetadata: {
      name: name,
      keyvalues: {
        symbol: symbol,
        royalty: royalty,
        IP_Rights: xtraUrl,
        recipient: address,
      },
    },
    pinataOptions: {
      cidVersion: 0,
    },
  };
  const readableStreamForFile = fs.createReadStream(uploadPath + fileName);

  try {
    let result = await pinata.pinFileToIPFS(readableStreamForFile, options);
    return result;
  } catch (error) {
    console.error(error.message);
    return "failed to pin file to ipfs";
  }
};

// pin image for bundle
const pinBundleFileToIPFS = async (fileName, name, address) => {
  const options = {
    pinataMetadata: {
      name: name,
      keyvalues: {
        bundleName: name,
        address: address,
      },
    },
    pinataOptions: {
      cidVersion: 0,
    },
  };
  const readableStreamForFile = fs.createReadStream(uploadPath + fileName);

  try {
    let result = await pinata.pinFileToIPFS(readableStreamForFile, options);
    return result;
  } catch (error) {
    return "failed to pin file to ipfs";
  }
};

// pin banner image
const pinBannerFileToIPFS = async (fileName, address) => {
  const options = {
    pinataMetadata: {
      name: address,
      keyvalues: {},
    },
    pinataOptions: {
      cidVersion: 0,
    },
  };
  const readableStreamForFile = fs.createReadStream(uploadPath + fileName);

  try {
    let result = await pinata.pinFileToIPFS(readableStreamForFile, options);
    return result;
  } catch (error) {
    return "failed to pin file to ipfs";
  }
};

// pin image for collection
const pinCollectionFileToIPFS = async (fileName, name, address) => {
  const options = {
    pinataMetadata: {
      name: name,
      keyvalues: {
        bundleName: name,
        address: address,
      },
    },
    pinataOptions: {
      cidVersion: 0,
    },
  };
  const readableStreamForFile = fs.createReadStream(uploadPath + fileName);

  try {
    let result = await pinata.pinFileToIPFS(readableStreamForFile, options);
    return result;
  } catch (error) {
    return "failed to pin file to ipfs";
  }
};
// pin json to ipfs for NFT
const pinJsonToIPFS = async (jsonMetadata) => {
  const options = {
    pinataMetadata: {
      name: jsonMetadata.name,
      keyvalues: {
        address: jsonMetadata.properties.address,
      },
    },
    pinataOptions: {
      cidVersion: 0,
    },
  };

  try {
    let result = await pinata.pinJSONToIPFS(jsonMetadata, options);
    return result;
  } catch (error) {
    return "failed to pin json to ipfs";
  }
};
// pin json to ipfs for bundle
const pinBundleJsonToIPFS = async (jsonMetadata) => {
  const options = {
    pinataMetadata: {
      name: jsonMetadata.name,
      keyvalues: {
        bundleName: jsonMetadata.name,
      },
    },
    pinataOptions: {
      cidVersion: 0,
    },
  };

  try {
    let result = await pinata.pinJSONToIPFS(jsonMetadata, options);
    return result;
  } catch (error) {
    return "failed to pin json to ipfs";
  }
};

router.get("/ipfstest", async (req, res) => {
  pinata
    .testAuthentication()
    .then((result) => {
      res.send({
        result: result,
      });
    })
    .catch((err) => {
      res.send({
        result: "failed",
      });
    });
});
router.get("/test", auth, async (req, res) => {
  return res.json({
    apistatus: "running",
  });
});

router.post("/uploadImage2Server", auth, async (req, res) => {
  let form = new formidable.IncomingForm({
    maxFileSize: 200 * 1024 * 1024,
    maxFieldsSize: 300 * 1024 * 1024,
  });
  try {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("[1] uploadToIPFSerr: ", {err});
        return res.status(400).json({
          status: "failed",
        });
      } else {
        const ipfsUri = ipfsUris[Math.floor(Math.random() * ipfsUris.length)];
        let imgData = fields.image;
        let name = fields.name;
        // let address = fields.account;
        // address = toLowerCase(address);

        /* change getting address from auth token */
        let address = extractAddress(req, res);

        let description = fields.description;
        let symbol = fields.symbol;
        let royalty = fields.royalty;

        let xtraUrl = fields.xtra;
        if (xtraUrl && !validUrl.isUri(xtraUrl)) {
          console.error("[2] uploadToIPFSerr: ", {xtraUrl});
          return res.status(400).json({
            status: "failed",
          });
        }

        let extension = imgData.substring(
          "data:image/".length,
          imgData.indexOf(";base64")
        );
        console.log({name: name.replace(" ", ""), symbol: symbol.replace(" ", "")})
        let imageFileName =
          address + "_" + name.replace(" ", "") + "_" + `${symbol ? symbol.replace(" ", "") : ""}` + "_" + Date.now() + "." + extension;
        imgData = imgData.replace(`data:image\/${extension};base64,`, "");
        fs.writeFile(uploadPath + imageFileName, imgData, "base64", async (err) => {
          if (err) {
            console.error("[3] uploadToIPFSerr: ", {err});
            return res.status(400).json({
              status: "failed to save an image file",
              err,
            });
          } else {
            let filePinStatus = await pinFileToIPFS(
              imageFileName,
              address,
              name,
              symbol,
              royalty,
              xtraUrl
            );

            // remove file once pinned
            try {
              fs.unlinkSync(uploadPath + imageFileName);
            } catch (error) {
            }

            let now = new Date();
            let currentTime = now.toTimeString();

            let metaData = {
              name: name,
              image: ipfsUri + filePinStatus.IpfsHash,
              description: description,
              properties: {
                symbol: symbol,
                address: address,
                royalty: royalty,
                recipient: address,
                IP_Rights: xtraUrl,
                createdAt: currentTime,
                collection: "Fantom Powered NFT Collection",
              },
            };

            let jsonPinStatus = await pinJsonToIPFS(metaData);
            return res.send({
              status: "success",
              uploadedCounts: 2,
              fileHash: ipfsUri + filePinStatus.IpfsHash,
              jsonHash: ipfsUri + jsonPinStatus.IpfsHash,
            });
          }
        });
      }
    });
  } catch (error) {
    console.error(error.message);
    return res.json({
      status: "failed",
    });
  }
});

router.post("/uploadBundleImage2Server", auth, async (req, res) => {
  let form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        status: "failedParsingForm",
      });
    } else {
      const ipfsUri = ipfsUris[Math.floor(Math.random()*ipfsUris.length)];
      let imgData = fields.imgData;
      let name = fields.name;
      let description = fields.description;
      let address = fields.address;
      address = toLowerCase(address);
      let extension = imgData.substring(
        "data:image/".length,
        imgData.indexOf(";base64")
      );
      let imageFileName = address + name.replace(" ", "") + "." + extension;
      imgData = imgData.replace(`data:image\/${extension};base64,`, "");
      fs.writeFile(uploadPath + imageFileName, imgData, "base64", (err) => {
        if (err) {
          return res.status(400).json({
            status: "failed to save an image file",
            err,
          });
        }
      });

      let filePinStatus = await pinBundleFileToIPFS(
        imageFileName,
        name,
        address
      );
      // remove file once pinned
      try {
        fs.unlinkSync(uploadPath + imageFileName);
      } catch (error) {}

      let bundle = new Bundle();
      bundle.bundleName = name;
      bundle.description = description;
      bundle.imageHash = ipfsUri + filePinStatus.IpfsHash;
      bundle.address = address;

      try {
        let saveStatus = await bundle.save();
        if (saveStatus) {
          return res.send({
            status: "success",
            bundle: saveStatus,
          });
        } else {
          return res.status(400).json({
            status: "failedSavingToDB",
          });
        }
      } catch (error) {
        return res.status(400).json({
          status: "failedOutSave",
        });
      }
    }
  });
});

const generateRandomName = () => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};
// pin banner image
router.post("/uploadBannerImage2Server", auth, async (req, res) => {
  let form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        status: "failedParsingForm",
      });
    } else {
      let imgData = fields.imgData;

      /* change getting address from auth token */
      let address = extractAddress(req, res);
      let name = generateRandomName();

      let extension = imgData.substring(
        "data:image/".length,
        imgData.indexOf(";base64")
      );
      let imageFileName = address + name.replace(" ", "") + "." + extension;
      imgData = imgData.replace(`data:image\/${extension};base64,`, "");
      fs.writeFile(uploadPath + imageFileName, imgData, "base64", (err) => {
        if (err) {
          return res.status(400).json({
            status: "failed to save an image file",
            err,
          });
        }
      });

      let filePinStatus = await pinBannerFileToIPFS(imageFileName, address);
      // remove file once pinned

      try {
        let account = await Account.findOne({
          address: address,
        });
        if (account) {
          account.bannerHash = filePinStatus.IpfsHash;
          await account.save();
        } else {
          let _account = new Account();
          _account.address = address;
          _account.bannerHash = filePinStatus.IpfsHash;
          await _account.save();
        }
      } catch (error) {}
      try {
        fs.unlinkSync(uploadPath + imageFileName);
      } catch (error) {}
      return res.json({
        status: "success",
        data: filePinStatus.IpfsHash,
      });
    }
  });
});

// pin collection image
router.post("/uploadCollectionImage2Server", auth, async (req, res) => {
  let form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.log("error in parsing the form");
      console.log(err);
      return res.status(400).json({
        status: "failedParsingForm",
      });
    } else {
      let imgData = fields.imgData;
      let name = fields.collectionName;
      // let address = fields.erc721Address;
      // address = toLowerCase(address);

      // change getting address from auth token
      let address = extractAddress(req, res);

      let extension = imgData.substring(
        "data:image/".length,
        imgData.indexOf(";base64")
      );
      let imageFileName = address + name.replace(" ", "") + "." + extension;
      imgData = imgData.replace(`data:image\/${extension};base64,`, "");
      fs.writeFile(uploadPath + imageFileName, imgData, "base64", (err) => {
        if (err) {
          console.log("failed to upload a collection image file");
          console.log(err);
          return res.status(400).json({
            status: "failed to save an image file",
            err,
          });
        }
      });

      let filePinStatus = await pinCollectionFileToIPFS(
        imageFileName,
        name,
        address
      );
      // remove file once pinned
      try {
        fs.unlinkSync(uploadPath + imageFileName);
      } catch (error) {}
      return res.json({
        status: "success",
        data: filePinStatus.IpfsHash,
      });
    }
  });
});

module.exports = router;
