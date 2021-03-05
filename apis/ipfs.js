require("dotenv").config();
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const formidable = require("formidable");
const router = require("express").Router();

const pinFileToIPFS = async (fileName) => {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
  let data = new FormData();
  data.append("file", fs.createReadStream("/uploads/" + fileName));
  const res = await axios.post(url, data, {
    maxContentLength: "Infinity",
    headers: {
      "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
      pinata_api_key: process.env.PINATA_API_KEY,
      pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
    },
  });
  console.log(res.data);
};
const pinJsonToIPFS = async (fileName) => {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
  let data = new FormData();
  data.append("file", fs.createReadStream("/uploads/" + fileName));
  try {
    const res = await axios.post(url, data, {
      headers: {
        maxContentLength: "Infinity",
        "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
        pinata_api_key: process.env.PINATA_API_KEY,
        pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
      },
    });
    console.log(res.data);
  } catch (err) {
    console.error(err);
  }
};

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
      let limit = fields.limit;
      let imageFileName = address + now.toString() + ".png";
      let jsonFileName = address + now.toString() + ".json";
      imgData = imgData.replace(/^data:image\/png;base64,/, "");
      fs.writeFile("uploads/" + imageFileName, imgData, "base64", (err) => {
        if (err) {
          return res.status(400).json({
            status: "failed",
          });
        }
        // create a json file here & save
        let metaData = {
          name: name,
          fileName: imageFileName,
          address: address,
          limit: limit,
        };
        let jsonMetadata = JSON.stringify(metaData);
        fs.writeFile("uploads/" + jsonFileName, jsonMetadata, async (err) => {
          if (err) {
            return res.status(400).json({
              status: "failed",
            });
          }
          await pinFileToIPFS(imageFileName);
          await pinJsonToIPFS(jsonFileName);
        });
      });
    }
  });

  return res.json({
    status: "success",
  });
});

module.exports = router;
