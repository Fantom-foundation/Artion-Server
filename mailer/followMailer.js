require("dotenv").config();
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const app_url = process.env.APP_URL;
const foundationEmail = "support.artion@fantom.foundation";
const team = "Artion team from Fantom Foundation";

const mongoose = require("mongoose");
const toLowerCase = require("../utils/utils");
const Account = mongoose.model("Account");
const Follow = mongoose.model("Follow");
const NFTITEM = mongoose.model("NFTITEM");

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
    console.log("followers");
    console.log(followers);
    let addresses = followers.map((follower) => follower.from);
    let accounts = await Account.find({ address: { $in: addresses } });
    let emails = accounts.map((account) =>
      account.email ? account.email : null
    );
    console.log("emails");
    console.log(emails);

    let owner = await getUserAlias(address);
    let message = {
      to: emails,
      from: foundationEmail,
      subject: "New Bundle Created",
      text: "artion notification",
      html: `Dear Artion User! <br/> Artion user(${owner}) has created a  new Bundle(${bundleName}).  <br/> For more information, click <a href = "${artionUri}">here</a></br><br/></br><br/>  ${team}`,
    };
    sgMail.sendMultiple(message).then(
      () => {
        console.log("email has been sent");
      },
      (error) => {
        if (error.response) {
          console.log("notify new bundle, in sending email");
          console.log(error);
        }
      }
    );
  } catch (error) {
    console.log("catch ----");
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
      html: `Dear Artion User! <br/> New NFT Item(${nftName}) has shown up in ${owner}'s account.  <br/> For more information, click <a href = "${artionUri}">here</a></br><br/></br><br/>  ${team}`,
    };
    sgMail.sendMultiple(message).then(
      () => {},
      (error) => {
        if (error.response) {
          console.log("notify new nft item, in sending email");
          console.log(error);
        }
      }
    );
  } catch (error) {}
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
    let accounts = await Account.find({ address: { $in: addresses } });
    let emails = accounts.map((account) =>
      account.email ? account.email : null
    );
    let message = {
      to: emails,
      from: foundationEmail,
      subject: "Auction Reserve Price Update",
      text: "artion notification",
      html: `Dear Artion User! <br/> Auction price for NFT Item(${nftName}) has updated to ${price} FTM in ${owner}'s account.  <br/> For more information, click <a href = "${artionUri}">here</a></br><br/></br><br/>  ${team}`,
    };
    sgMail.sendMultiple(message).then(
      () => {},
      (error) => {
        if (error.response) {
          console.log("notify auction reserve price, in sending email");
          console.log(error);
        }
      }
    );
  } catch (error) {
    console.log("notifyAuctionPriceUpdate catch");
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
    let accounts = await Account.find({ address: { $in: addresses } });
    let emails = accounts.map((account) =>
      account.email ? account.email : null
    );
    let message = {
      to: emails,
      from: foundationEmail,
      subject: "New Item Listing",
      text: "artion notification",
      html: `Dear Artion User! <br/> ${owner} has listed ${quantity} ${nftName}${
        quantity > 1 ? "s" : null
      } at ${price} FTM  <br/> For more information, click <a href = "${artionUri}">here</a></br><br/></br><br/>  ${team}`,
    };
    sgMail.sendMultiple(message).then(
      () => {},
      (error) => {
        if (error.response) {
          console.log("notify new item listing, in sending email");
          console.log(error);
        }
      }
    );
  } catch (error) {
    console.log("notifySingleItemListed catch");
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
        html: `Dear Artion User! <br/> NFT Item(${nftName}) is now on Auction.  <br/> For more information, click <a href = "${artionUri}">here</a></br><br/></br><br/>  ${team}`,
      };
      sgMail.sendMultiple(message).then(
        () => {},
        (error) => {
          if (error.response) {
            console.log("notify new auction, in sending email");
            console.log(error);
          }
        }
      );
    } catch (error) {}
  } catch (error) {
    console.log("notifyNewAuction catch");
    console.log(error);
  }
};

const notifyBundleListing = async (bundleID, bundleName, address, price) => {
  const artionUri = `${app_url}bundle/${bundleID}`;
  try {
    const followers = await Follow.find({ to: address });
    console.log("followers");
    console.log(followers);
    let addresses = followers.map((follower) => follower.from);
    let accounts = await Account.find({ address: { $in: addresses } });
    let emails = accounts.map((account) =>
      account.email ? account.email : null
    );
    console.log("emails");
    console.log(emails);

    let owner = await getUserAlias(address);
    let message = {
      to: emails,
      from: foundationEmail,
      subject: "Bundle Listed",
      text: "artion notification",
      html: `Dear Artion User! <br/> Artion user(${owner}) has listed a  Bundle(${bundleName}) at ${price} FTM.  <br/> For more information, click <a href = "${artionUri}">here</a></br><br/></br><br/>  ${team}`,
    };
    sgMail.sendMultiple(message).then(
      () => {
        console.log("email has been sent");
      },
      (error) => {
        if (error.response) {
          console.log("cannot send email");
        }
      }
    );
  } catch (error) {
    console.log("catch ----");
    console.log(error);
  }
};

const notifications = {
  notifyBundleCreation,
  nofifyNFTShowUp,
  notifyAuctionPriceUpdate,
  notifySingleItemListed,
  notifyNewAuction,
  notifyBundleListing,
};

module.exports = notifications;
