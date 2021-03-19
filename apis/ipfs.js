require("dotenv").config();
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const formidable = require("formidable");
const router = require("express").Router();

const pinataSDK = require("@pinata/sdk");
const pinata = pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_SECRET_API_KEY
);

const pinFileToIPFS = async (fileName, address, name, symbol) => {
  const options = {
    pinataMetadata: {
      name: name,
      keyvalues: {
        address: address,
        symbol: symbol,
      },
    },
    pinataOptions: {
      cidVersion: 0,
    },
  };
  const readableStreamForFile = fs.createReadStream("uploads/" + fileName);

  try {
    let result = await pinata.pinFileToIPFS(readableStreamForFile, options);
    return result;
  } catch (error) {
    console.log(error);
    return "failed to pin file to ipfs";
  }
};

const pinJsonToIPFS = async (jsonMetadata) => {
  const options = {
    pinataMetadata: {
      name: jsonMetadata.name,
      keyvalues: {
        address: jsonMetadata.address,
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
    console.log(error);
    return "failed to pin json to ipfs";
  }
};

router.get("/ipfstest", async (req, res, next) => {
  pinata
    .testAuthentication()
    .then((result) => {
      console.log(result);
      res.send({
        result: result,
      });
    })
    .catch((err) => {
      console.log(err);
      res.send({
        result: "failed",
      });
    });
});

router.post("/uploadImage2Server", async (req, res, next) => {
  let now = Date.now();
  let form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        status: "failed",
      });
    } else {
      let imgData = fields.image;
      let name = fields.name;
      let address = fields.address;
      let royalty = fields.royalty;
      let description = fields.description;
      let category = fields.category;
      let symbol = fields.symbol;
      let imageFileName = address + now.toString() + ".png";
      imgData = imgData.replace(/^data:image\/png;base64,/, "");
      await fs.writeFile(
        "uploads/" + imageFileName,
        imgData,
        "base64",
        (err) => {
          if (err) {
            return res.status(400).json({
              status: "failed",
            });
          }
        }
      );
      let filePinStatus = await pinFileToIPFS(
        imageFileName,
        address,
        name,
        symbol
      );

      // remove file once pinned
      fs.unlinkSync("uploads/" + imageFileName);

      let metaData = {
        name: name,
        symbol: symbol,
        fileName: imageFileName,
        address: address,
        royalty: royalty,
        description: description,
        category: category,
        imageHash: filePinStatus.IpfsHash,
      };

      let jsonPinStatus = await pinJsonToIPFS(metaData);
      return res.send({
        status: "success",
        uploadedCounts: 2,
        fileHash: filePinStatus.IpfsHash,
        jsonHash: jsonPinStatus.IpfsHash,
      });
    }
  });
});

module.exports = router;
