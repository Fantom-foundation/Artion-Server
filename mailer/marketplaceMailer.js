require("dotenv").config();
const mongoose = require("mongoose");
const NFTITEM = mongoose.model("NFTITEM");
const messageUtils = require("./message.utils");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const app_url = process.env.APP_URL;
const storage_url = process.env.RUNTIME
  ? "https://storage.testnet.artion.io/image/"
  : "https://storage.artion.io/image/";

const getNFTThumbnailPath = async (nft, tokenID) => {
  try {
    let token = await NFTITEM.findOne({
      contractAddress: toLowerCase(nft),
      tokenID: tokenID,
    });
    if (token) return token.thumbnailPath;
    else return null;
  } catch (error) {
    return null;
  }
};
const createMessage = async (data) => {
  let message = {};
  let event = data.event;
  switch (event) {
    case "ItemSold":
      {
        if (data.isBuyer) {
          let to = [data.to];
          let name = data.tokenName;
          let title = "NFT Item Purchased!";
          let content = `Congratulations! You have purchased ${name}.`;
          let image = await getNFTThumbnailPath(data.nftAddress, data.tokenID);
          image = `${storage_url}${image}`;
          let link = `${app_url}explore/${data.nftAddress}/${data.tokenID}`;
          message = messageUtils.createNFTItemMessage({
            to,
            title,
            content,
            image,
            name,
            link,
          });
        } else {
          let to = [data.to];
          let name = data.tokenName;
          let title = "NFT Item Sold!";
          let content = `Congratulations! You have sold ${name}.`;
          let image = await getNFTThumbnailPath(data.nftAddress, data.tokenID);
          image = `${storage_url}${image}`;
          let link = `${app_url}explore/${data.nftAddress}/${data.tokenID}`;
          message = messageUtils.createNFTItemMessage({
            to,
            title,
            content,
            image,
            name,
            link,
          });
        }
      }
      break;
    case "OfferCreated":
      {
        if (data.type == 721) {
          let to = [data.to];
          let name = data.tokenName;
          let title = "Offer Created!";
          let content = `Congratulations! Someone sent you an offer for ${name}.`;
          let image = await getNFTThumbnailPath(data.nftAddress, data.tokenID);
          image = `${storage_url}${image}`;
          let link = `${app_url}explore/${data.nftAddress}/${data.tokenID}`;
          message = messageUtils.createNFTItemMessage({
            to,
            title,
            content,
            image,
            name,
            link,
          });
        } else {
        }
      }
      break;
    case "OfferCanceled":
      {
        if (data.type == 721) {
          let to = [data.to];
          let name = data.tokenName;
          let title = "Offer Canceled!";
          let content = `Offer to your nft item, ${name} is now canceled.`;
          let image = await getNFTThumbnailPath(data.nftAddress, data.tokenID);
          image = `${storage_url}${image}`;
          let link = `${app_url}explore/${data.nftAddress}/${data.tokenID}`;
          message = messageUtils.createNFTItemMessage({
            to,
            title,
            content,
            image,
            name,
            link,
          });
        } else {
        }
      }
      break;
  }

  return message;
};

const sendEmailMarketplace = async (data) => {
  let message = await createMessage(data);
  sgMail.sendMultiple(message, (error, result) => {
    if (error) {
      console.log(error);
    } else {
      console.log("That's was it!");
    }
  });
};

module.exports = sendEmailMarketplace;
