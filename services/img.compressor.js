require("dotenv").config();
const axios = require("axios");

const IMG_BB_PK = process.env.IMGBB_API_KEY;

const uploadImage = async (imgData) => {
  let response = await axios.post("IMG_BB_API", {
    key: IMG_BB_PK,
    image: imgData,
  });
  if (response.status == 200) {
    return {
      url: response.data.url,
      thumb: response.thumb.url,
    };
  } else {
    return null;
  }
};

module.exports = uploadImage;
