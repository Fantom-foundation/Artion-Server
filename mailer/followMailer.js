require("dotenv").config();
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const app_url = process.env.APP_URL;
const foundationEmail = "support.artion@fantom.foundation";

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

const notifyBundleCreation = async (address, bundleID, bundleName) => {
  const artionUri = `${app_url}bundle/${bundleID}`;
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

    let owner = await getUserAlias(address);
    let message = {
      to: emails,
      from: foundationEmail,
      subject: "New Bundle Created",
      text: "artion notification",
      html: `Dear Artion User! <br/> Artion user(${owner}) has created a  new Bundle(${bundleName}).  <br/> For more information, click <a href = "${artionUri}">here</a></br><br/></br><br/>`,
    };
    sgMail.sendMultiple(message).then(
      () => {
        console.log("email has been sent");
      },
      (error) => {
        if (error.response) {
        }
      }
    );
  } catch (error) {
    console.log("bundle creation error");
    console.log(error);
  }
};

const nofifyNFTShowUp = async (address, contractAddress, tokenID) => {
  address = toLowerCase(address);
  contractAddress = toLowerCase(contractAddress);
  tokenID = parseInt(tokenID);
  const artionUri = `${app_url}explore/${contractAddress}/${tokenID}`;
  try {
    const followers = await Follow.find({ to: address });
    let addresses = followers.map((follower) => follower.from);
    let accounts = await Account.find({ address: { $in: addresses } });
    let emails = accounts.map((account) =>
      account.email ? account.email : null
    );

    let owner = await getUserAlias(address);
    let nftName = await getNFTItemName(contractAddress, tokenID);
    let message = {
      to: emails,
      from: foundationEmail,
      subject: "New NFT Item Created",
      text: "artion notification",
      html: `Dear Artion User! <br/> New NFT Item(${nftName}) has shown up in ${owner}'s account.  <br/> For more information, click <a href = "${artionUri}">here</a></br><br/></br><br/>`,
    };
    sgMail.sendMultiple(message).then(
      () => {},
      (error) => {
        if (error.response) {
        }
      }
    );
  } catch (error) {
    console.log("new item creation error");
    console.log(error);
  }
};

const notifyAuctionPriceUpdate = async (contractAddress, tokenID, price) => {
  try {
    const artionUri = `${app_url}explore/${contractAddress}/${tokenID}`;
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
    let message = {
      to: emails,
      from: foundationEmail,
      subject: "Auction Reserve Price Update",
      text: "artion notification",
      html: `Dear Artion User! <br/> Auction price for NFT Item(${nftName}) has updated to ${price} FTM in ${owner}'s account.  <br/> For more information, click <a href = "${artionUri}">here</a></br><br/></br><br/>`,
    };
    sgMail.sendMultiple(message).then(
      () => {},
      (error) => {
        if (error.response) {
          console.log("auction price update send mail error");
          console.log(error);
        }
      }
    );
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
    addresses = await extractEmailSubscribedAddresses(addresses, "fNftList");
    let accounts = await Account.find({ address: { $in: addresses } });
    let emails = accounts.map((account) =>
      account.email ? account.email : null
    );
    console.log("emails are ");
    console.log(emails);
    let message = {
      to: emails,
      from: foundationEmail,
      subject: "New Item Listing",
      text: "artion notification",
      html: `Dear Artion User! <br/> ${owner} has listed ${quantity} ${nftName}${
        quantity > 1 ? "s" : ""
      } at ${price} FTM  <br/> For more information, click <a href = "${artionUri}">here</a></br><br/></br><br/>  `,
    };
    sgMail.sendMultiple(message).then(
      () => {},
      (error) => {
        if (error.response) {
        }
      }
    );
  } catch (error) {
    console.log("notify single item listed error");
    console.log(error);
  }
};

const notifyNewAuction = async (contractAddress, tokenID) => {
  try {
    const artionUri = `${app_url}explore/${contractAddress}/${tokenID}`;
    try {
      let nftItem = await NFTITEM.findOne({
        contractAddress: contractAddress,
        tokenID: tokenID,
      });
      let address = nftItem.owner;
      const followers = await Follow.find({ to: address });
      let addresses = followers.map((follower) => follower.from);
      addresses = await extractEmailSubscribedAddresses(
        addresses,
        "fNftAuction"
      );
      let accounts = await Account.find({ address: { $in: addresses } });
      let emails = accounts.map((account) =>
        account.email ? account.email : null
      );
      let nftName = nftItem.name;
      let message = {
        to: emails,
        from: foundationEmail,
        subject: "New Auction",
        text: "artion notification",
        html: `Dear Artion User! <br/> NFT Item(${nftName}) is now on Auction.  <br/> For more information, click <a href = "${artionUri}">here</a></br><br/></br><br/>`,
      };
      sgMail.sendMultiple(message).then(
        () => {},
        (error) => {
          if (error.response) {
            console.log("nft auction error");
            console.log(error);
          }
        }
      );
    } catch (error) {
      console.log("nft auction error");
      console.log(error);
    }
  } catch (error) {
    console.log("nft auction error");
    console.log(error);
  }
};

const notifyBundleListing = async (bundleID, bundleName, address, price) => {
  const artionUri = `${app_url}bundle/${bundleID}`;
  try {
    const followers = await Follow.find({ to: address });
    let addresses = followers.map((follower) => follower.from);
    addresses = await extractEmailSubscribedAddresses(addresses, "fBundleList");
    let accounts = await Account.find({ address: { $in: addresses } });
    let emails = accounts.map((account) =>
      account.email ? account.email : null
    );

    let owner = await getUserAlias(address);
    let message = {
      to: emails,
      from: foundationEmail,
      subject: "Bundle Listed",
      text: "artion notification",
      html: `Dear Artion User! <br/> Artion user(${owner}) has listed a  Bundle(${bundleName}) at ${price} FTM.  <br/> For more information, click <a href = "${artionUri}">here</a></br><br/></br><br/>  `,
    };
    sgMail.sendMultiple(message).then(
      () => {},
      (error) => {
        if (error.response) {
          console.log("bundle send mail listed error");
          console.log(error);
        }
      }
    );
  } catch (error) {
    console.log("bundle listed error");
    console.log(error);
  }
};

const notifyBundleUpdate = async (bundleID, bundleName, address, price) => {
  const artionUri = `${app_url}bundle/${bundleID}`;
  try {
    const followers = await Follow.find({ to: address });
    let addresses = followers.map((follower) => follower.from);
    addresses = await extractEmailSubscribedAddresses(
      addresses,
      "fBundlePrice"
    );
    let accounts = await Account.find({ address: { $in: addresses } });
    let emails = accounts.map((account) =>
      account.email ? account.email : ""
    );
    console.log("emails are ");
    console.log(emails);

    let owner = await getUserAlias(address);
    console.log(`owner is ${owner}`);
    let message = {
      to: emails,
      from: foundationEmail,
      subject: "Bundle Updated",
      text: "artion notification",
      html: `Dear Artion User! <br/> Artion user(${owner}) has updated a Bundle(${bundleName})'s price to ${price} FTM.  <br/> For more information, click <a href = "${artionUri}">here</a></br><br/></br><br/>  `,
    };
    console.log("message is ", message);
    sgMail.sendMultiple(message).then(
      () => {},
      (error) => {
        if (error.response) {
          console.log("notify bundle update send mail error");
          console.log(error);
        }
      }
    );
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
    let message = {
      to: emails,
      from: foundationEmail,
      subject: "Item Update",
      text: "artion notification",
      html: `Dear Artion User! <br/> ${owner} has updated ${nftName} to ${price} FTM  <br/> For more information, click <a href = "${artionUri}">here</a></br><br/></br><br/>  `,
    };
    sgMail.sendMultiple(message).then(
      () => {},
      (error) => {
        if (error.response) {
        }
      }
    );
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
