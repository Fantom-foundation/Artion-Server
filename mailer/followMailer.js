require("dotenv").config();

const messageUtils = require("./message.utils");

const app_url = process.env.APP_URL;
const storage_url = process.env.RUNTIME
  ? "https://storage.testnet.artion.io/image/"
  : "https://storage.artion.io/image/";

const mongoose = require("mongoose");
const toLowerCase = require("../utils/utils");
const Account = mongoose.model("Account");
const Follow = mongoose.model("Follow");
const NFTITEM = mongoose.model("NFTITEM");
const NotificationSetting = mongoose.model("NotificationSetting");

const getUserAlias = async (walletAddress) => {
  try {
    let account = await Account.findOne({ address: walletAddress });
    if (account) return account.alias;
    else return walletAddress;
  } catch (error) {
    return walletAddress;
  }
};

const getNFTItemName = async (nft, tokenID) => {
  try {
    let token = await NFTITEM.findOne({
      contractAddress: toLowerCase(nft),
      tokenID: tokenID,
    });
    if (token) return token.name ? token.name : tokenID;
    else return tokenID;
  } catch (error) {
    return tokenID;
  }
};
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

const notifyBundleCreation = async (address, bundleID, bundleName) => {
  try {
    const followers = await Follow.find({ to: address });
    let addresses = followers.map((follower) => follower.from);
    addresses = await extractEmailSubscribedAddresses(
      addresses,
      "fBundleCreation"
    );
    let accounts = await Account.find({ address: { $in: addresses } });
    let emails = accounts.map((account) =>
      account.email ? account.email : null
    );
    emails = emails.filter((email) => email);
    let owner = await getUserAlias(address);

    // create data for dynamic email spread out
    let to = messageUtils.createEmailList(emails);
    let title = "New Bundle Created!";
    let content = `Artion User(${owner}) has created ${bundleName} bundle.`;
    let link = `${app_url}bundle/${bundleID}`;

    let message = messageUtils.createBundleItemMessage({
      to,
      title,
      content,
      link,
    });
    // call send function here
  } catch (error) {
    console.log(error);
  }
};

const nofifyNFTShowUp = async (address, contractAddress, tokenID) => {
  address = toLowerCase(address);
  contractAddress = toLowerCase(contractAddress);
  tokenID = parseInt(tokenID);
  try {
    const followers = await Follow.find({ to: address });
    let addresses = followers.map((follower) => follower.from);
    let accounts = await Account.find({ address: { $in: addresses } });
    let emails = accounts.map((account) =>
      account.email ? account.email : null
    );
    emails = emails.filter((email) => email);
    let owner = await getUserAlias(address);
    let nftName = await getNFTItemName(contractAddress, tokenID);

    // create data for dynamic email spread out
    let to = messageUtils.createEmailList(emails);
    let title = "New NFT Item Created!";
    let content = `Artion User(${owner}) has created ${nftName} nft item.`;
    let image = await getNFTThumbnailPath(contractAddress, tokenID);
    image = `${storage_url}${image}`;
    let name = nftName;
    let link = `${app_url}explore/${contractAddress}/${tokenID}`;
    let message = messageUtils.createNFTItemMessage({
      to,
      title,
      content,
      image,
      name,
      link,
    });
    // call send function here
  } catch (error) {
    console.log("new item creation error");
    console.log(error);
  }
};

const notifyAuctionPriceUpdate = async (contractAddress, tokenID, price) => {
  try {
    contractAddress = toLowerCase(contractAddress);
    let nft = await NFTITEM.findOne({
      contractAddress: contractAddress,
      tokenID: tokenID,
    });
    let nftName = nft.name ? nft.name : nft.tokenID;
    let address = nft.owner;
    let ownerAccount = await Account.findOne({ address: address });
    let owner = ownerAccount.alias;

    const followers = await Follow.find({ to: address });
    let addresses = followers.map((follower) => follower.from);
    addresses = await extractEmailSubscribedAddresses(
      addresses,
      "fNftAuctionPrice"
    );
    let accounts = await Account.find({ address: { $in: addresses } });
    let emails = accounts.map((account) =>
      account.email ? account.email : null
    );
    emails = emails.filter((email) => email);

    // create data for dynamic email spread out
    let to = messageUtils.createEmailList(emails);
    let title = "Auction Price Updated!";
    let content = `Artion User(${owner}) has updated an auction price.`;
    let image = await getNFTThumbnailPath(contractAddress, tokenID);
    image = `${storage_url}${image}`;
    let name = nftName;
    let link = `${app_url}explore/${contractAddress}/${tokenID}`;
    let message = messageUtils.createNFTItemMessage({
      to,
      title,
      content,
      image,
      name,
      link,
    });
    // call send function here
  } catch (error) {
    console.log("auction price udpate error");
    console.log(error);
  }
};

const notifySingleItemListed = async (
  address,
  contractAddress,
  tokenID,
  quantity,
  price
) => {
  try {
    let nft = await NFTITEM.findOne({
      contractAddress: contractAddress,
      tokenID: tokenID,
    });
    let nftName = nft.name ? nft.name : nft.tokenID;
    let ownerAccount = await Account.findOne({ address: address });
    let owner = ownerAccount.alias;

    const followers = await Follow.find({ to: address });
    let addresses = followers.map((follower) => follower.from);
    addresses = await extractEmailSubscribedAddresses(addresses, "fNftList");
    let accounts = await Account.find({ address: { $in: addresses } });
    let emails = accounts.map((account) =>
      account.email ? account.email : null
    );
    emails = emails.filter((email) => email);

    // create data for dynamic email spread out
    let to = messageUtils.createEmailList(emails);
    let title = "New Item Listed!";
    let content = `Artion User(${owner}) has listed a new NFT(${nftName}).`;
    let image = await getNFTThumbnailPath(contractAddress, tokenID);
    image = `${storage_url}${image}`;
    let name = nftName;
    let link = `${app_url}explore/${contractAddress}/${tokenID}`;
    let message = messageUtils.createNFTItemMessage({
      to,
      title,
      content,
      image,
      name,
      link,
    });
    // call send function here
  } catch (error) {
    console.log("notify single item listed error");
    console.log(error);
  }
};

const notifyNewAuction = async (contractAddress, tokenID) => {
  try {
    let nftItem = await NFTITEM.findOne({
      contractAddress: contractAddress,
      tokenID: tokenID,
    });
    let address = nftItem.owner;
    const followers = await Follow.find({ to: address });
    let addresses = followers.map((follower) => follower.from);
    addresses = await extractEmailSubscribedAddresses(addresses, "fNftAuction");
    let accounts = await Account.find({ address: { $in: addresses } });
    let emails = accounts.map((account) =>
      account.email ? account.email : null
    );
    emails = emails.filter((email) => email);
    let nftName = nftItem.name;

    // create data for dynamic email spread out
    let to = messageUtils.createEmailList(emails);
    let title = "New Auction!";
    let content = `Artion User(${owner}) has put an NFT in auction.`;
    let image = await getNFTThumbnailPath(contractAddress, tokenID);
    image = `${storage_url}${image}`;
    let name = nftName;
    let link = `${app_url}explore/${contractAddress}/${tokenID}`;
    let message = messageUtils.createNFTItemMessage({
      to,
      title,
      content,
      image,
      name,
      link,
    });
    // call send function here
  } catch (error) {
    console.log("nft auction error");
    console.log(error);
  }
};

const notifyBundleListing = async (bundleID, bundleName, address, price) => {
  try {
    const followers = await Follow.find({ to: address });
    let addresses = followers.map((follower) => follower.from);
    addresses = await extractEmailSubscribedAddresses(addresses, "fBundleList");
    let accounts = await Account.find({ address: { $in: addresses } });
    let emails = accounts.map((account) =>
      account.email ? account.email : null
    );
    emails = emails.filter((email) => email);
    let owner = await getUserAlias(address);

    // create data for dynamic email spread out
    let to = messageUtils.createEmailList(emails);
    let title = "Bundle Listed!";
    let content = `Artion User(${owner}) has listed ${bundleName} bundle.`;
    let link = `${app_url}bundle/${bundleID}`;

    let message = messageUtils.createBundleItemMessage({
      to,
      title,
      content,
      link,
    });
    // call send function here
  } catch (error) {
    console.log("bundle listed error");
    console.log(error);
  }
};

const notifyBundleUpdate = async (bundleID, bundleName, address, price) => {
  try {
    const followers = await Follow.find({ to: address });
    let addresses = followers.map((follower) => follower.from);
    addresses = await extractEmailSubscribedAddresses(
      addresses,
      "fBundlePrice"
    );
    let accounts = await Account.find({ address: { $in: addresses } });
    let emails = accounts.map((account) =>
      account.email ? account.email : null
    );
    emails = emails.filter((email) => email);
    let owner = await getUserAlias(address);

    // create data for dynamic email spread out
    let to = messageUtils.createEmailList(emails);
    let title = "Bundle Price Updated!";
    let content = `Artion User(${owner}) has updated ${bundleName} bundle's price.`;
    let link = `${app_url}bundle/${bundleID}`;

    let message = messageUtils.createBundleItemMessage({
      to,
      title,
      content,
      link,
    });
    // call send function here
  } catch (error) {
    console.log("notify bundle update");
    console.log(error);
  }
};

const nofityNFTUpdated = async (address, contractAddress, tokenID, price) => {
  try {
    const artionUri = `${app_url}explore/${contractAddress}/${tokenID}`;
    let nft = await NFTITEM.findOne({
      contractAddress: contractAddress,
      tokenID: tokenID,
    });
    let nftName = nft.name ? nft.name : nft.tokenID;
    let ownerAccount = await Account.findOne({ address: address });
    let owner = ownerAccount.alias;

    const followers = await Follow.find({ to: address });
    let addresses = followers.map((follower) => follower.from);
    addresses = await extractEmailSubscribedAddresses(addresses, "fNftPrice");
    let accounts = await Account.find({ address: { $in: addresses } });
    let emails = accounts.map((account) =>
      account.email ? account.email : null
    );
    emails = emails.filter((email) => email);

    // create data for dynamic email spread out
    let to = messageUtils.createEmailList(emails);
    let title = "NFT Price Updated!";
    let content = `Artion User(${owner}) has updated nft(${nftName})'s price.`;
    let image = await getNFTThumbnailPath(contractAddress, tokenID);
    image = `${storage_url}${image}`;
    let name = nftName;
    let link = `${app_url}explore/${contractAddress}/${tokenID}`;
    let message = messageUtils.createNFTItemMessage({
      to,
      title,
      content,
      image,
      name,
      link,
    });
    // call send function here
  } catch (error) {
    console.log("item update error");
    console.log(error);
  }
};

const extractEmailSubscribedAddresses = async (addresses, option) => {
  let notificationSettings;
  switch (option) {
    case "fBundleCreation":
      {
        notificationSettings = await NotificationSetting.find({
          fBundleCreation: true,
          address: { $in: addresses },
        });
      }
      break;
    case "fBundleList":
      {
        notificationSettings = await NotificationSetting.find({
          fBundleList: true,
          address: { $in: addresses },
        });
      }
      break;
    case "fBundlePrice":
      {
        notificationSettings = await NotificationSetting.find({
          fBundlePrice: true,
          address: { $in: addresses },
        });
      }
      break;
    case "fNftAuctionPrice":
      {
        notificationSettings = await NotificationSetting.find({
          fNftAuctionPrice: true,
          address: { $in: addresses },
        });
      }
      break;
    case "fNftList":
      {
        notificationSettings = await NotificationSetting.find({
          fNftList: true,
          address: { $in: addresses },
        });
      }
      break;
    case "fNftAuction":
      {
        notificationSettings = await NotificationSetting.find({
          fNftAuction: true,
          address: { $in: addresses },
        });
      }
      break;
    case "fNftPrice":
      {
        notificationSettings = await NotificationSetting.find({
          fNftPrice: true,
          address: { $in: addresses },
        });
      }
      break;

    case "sBundleBuy":
      {
        notificationSettings = await NotificationSetting.find({
          sBundleBuy: true,
          address: { $in: addresses },
        });
      }
      break;
    case "sBundleSell":
      {
        notificationSettings = await NotificationSetting.find({
          sBundleSell: true,
          address: { $in: addresses },
        });
      }
      break;
    case "sBundleOffer":
      {
        notificationSettings = await NotificationSetting.find({
          sBundleOffer: true,
          address: { $in: addresses },
        });
      }
      break;
    case "sBundleOfferCancel":
      {
        notificationSettings = await NotificationSetting.find({
          sBundleOfferCancel: true,
          address: { $in: addresses },
        });
      }
      break;
    case "sNftAuctionPrice":
      {
        notificationSettings = await NotificationSetting.find({
          sNftAuctionPrice: true,
          address: { $in: addresses },
        });
      }
      break;
    case "sNftBidToAuction":
      {
        notificationSettings = await NotificationSetting.find({
          sNftBidToAuction: true,
          address: { $in: addresses },
        });
      }
      break;
    case "sNftBidToAuctionCancel":
      {
        notificationSettings = await NotificationSetting.find({
          sNftBidToAuctionCancel: true,
          address: { $in: addresses },
        });
      }
      break;
    case "sAuctionWin":
      {
        notificationSettings = await NotificationSetting.find({
          sAuctionWin: true,
          address: { $in: addresses },
        });
      }
      break;
    case "sAuctionOfBidCancel":
      {
        notificationSettings = await NotificationSetting.find({
          sAuctionOfBidCancel: true,
          address: { $in: addresses },
        });
      }
      break;
    case "sNftSell":
      {
        notificationSettings = await NotificationSetting.find({
          sNftSell: true,
          address: { $in: addresses },
        });
      }
      break;
    case "sNftBuy":
      {
        notificationSettings = await NotificationSetting.find({
          sNftBuy: true,
          address: { $in: addresses },
        });
      }
      break;
    case "sNftOffer":
      {
        notificationSettings = await NotificationSetting.find({
          sNftOffer: true,
          address: { $in: addresses },
        });
      }
      break;
    case "sNftOfferCancel":
      {
        notificationSettings = await NotificationSetting.find({
          sNftOfferCancel: true,
          address: { $in: addresses },
        });
      }
      break;
    default: {
      notificationSettings = [];
    }
  }
  let notificationAddresses = [];
  notificationSettings.map((nss) => {
    if (!notificationAddresses.includes(nss.address))
      notificationAddresses.push(nss.address);
  });
  let subscribedAddresses = [];
  addresses.map((address) => {
    if (notificationAddresses.includes(address))
      subscribedAddresses.push(address);
  });
  return subscribedAddresses;
};

const notifications = {
  notifyBundleCreation,
  nofifyNFTShowUp,
  notifyAuctionPriceUpdate,
  notifySingleItemListed,
  notifyNewAuction,
  notifyBundleListing,
  nofityNFTUpdated,
  notifyBundleUpdate,
};

module.exports = notifications;
