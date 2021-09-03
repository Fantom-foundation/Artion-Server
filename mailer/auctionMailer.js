require("dotenv").config();
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const mongoose = require("mongoose");
const NFTITEM = mongoose.model("NFTITEM");
const messageUtils = require("./message.utils");

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
  if (data.type == "auction") {
    switch (event) {
      case "UpdateAuctionReservePrice":
        {
          let to = [data.to];
          let name = data.tokenName;
          let title = "Auction Price Update!";
          let content = `${name}'s auction price has been updated.`;
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
        break;
      case "BidPlaced":
        {
          let to = [data.to];
          let name = data.tokenName;
          let title = "Bid Placed to your NFT!";
          let content = `Your NFT Item, ${name} has got a new bid from ${data.bidderAlias}.`;
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
        break;
      case "BidWithdrawn":
        {
          let to = [data.to];
          let name = data.tokenName;
          let title = "Bid canceled!";
          let content = `Bid to your NFT Item, ${name} from ${data.bidderAlias} canceled.`;
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
        break;
      case "AuctionResulted":
        {
          let to = [data.to];
          let name = data.tokenName;
          let title = "Auction Resulted!";
          let content = `You purchased an item, ${data.collectionName}'s ${data.tokenName} as it's auction has been resulted.`;
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
        break;
      case "AuctionCancelled":
        {
          let to = [data.to];
          let name = data.tokenName;
          let title = "Auction Canceled!";
          let content = `Auction for ${data.collectionName}'s ${data.tokenName} canceled.`;
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
        break;
    }
  } else {
    //for marketplace
  } //for marketplace

  return message;
};

const sendEmailAuction = async (data) => {
  let message = await createMessage(data);
  sgMail.sendMultiple(message, (error, result) => {
    if (error) {
      console.log(error);
    } else {
      console.log("That's was it!");
    }
  });
};

module.exports = sendEmailAuction;
