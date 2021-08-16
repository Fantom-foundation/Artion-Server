require("dotenv").config();
const mongoose = require("mongoose");
const router = require("express").Router();

const Listing = mongoose.model("Listing");
const TradeHistory = mongoose.model("TradeHistory");
const Offer = mongoose.model("Offer");
const NFTITEM = mongoose.model("NFTITEM");
const Category = mongoose.model("Category");
const Account = mongoose.model("Account");
const NotificationSetting = mongoose.model("NotificationSetting");

const service_auth = require("./middleware/auth.tracker");

const sendEmail = require("../mailer/marketplaceMailer");
const notifications = require("../mailer/followMailer");
const getCollectionName = require("../mailer/utils");
const contractutils = require("../services/contract.utils");
const toLowerCase = require("../utils/utils");
const { getPrice } = require("../services/price.feed");

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

const getUserAlias = async (walletAddress) => {
  try {
    let account = await Account.findOne({ address: walletAddress });
    if (account) return account.alias;
    else return walletAddress;
  } catch (error) {
    return walletAddress;
  }
};

const isOfferCancelNotifiable = async (receiver, nft, tokenID) => {
  let contract = await contractutils.loadContractFromAddress(nft);
  let owner = await contract.ownerOf(tokenID);
  return toLowerCase(owner) == receiver;
};

router.post("/itemListed", service_auth, async (req, res) => {
  try {
    let owner = req.body.owner;
    let nft = req.body.nft;
    let tokenID = parseInt(req.body.tokenID);
    let quantity = parseInt(req.body.quantity);
    let pricePerItem = parseFloat(req.body.pricePerItem);
    let paymentToken = toLowerCase(req.body.paymentToken);
    let startingTime = parseFloat(req.body.startingTime);

    // first update the token price
    let category = await Category.findOne({ minterAddress: nft });
    if (category) {
      let token = await NFTITEM.findOne({
        contractAddress: nft,
        tokenID: tokenID,
      });
      if (token) {
        token.price = pricePerItem;
        token.paymentToken = paymentToken;
        token.listedAt = new Date(); // set listed date
        await token.save();
      }
    }
    // remove if the same icon list still exists
    try {
      await Listing.deleteMany({
        owner: owner,
        minter: nft,
        tokenID: tokenID,
      });
    } catch (error) {
      console.log("listing deletion error");
      console.log(error);
    }

    try {
      let newList = new Listing();
      newList.owner = owner;
      newList.minter = nft;
      newList.tokenID = tokenID;
      newList.quantity = quantity;
      newList.price = pricePerItem;
      newList.paymentToken = paymentToken;
      newList.startTime = startingTime;
      await newList.save();
    } catch (error) {
      console.log("new listing addition error");
      console.log(error);
    }
    // now notify followers
    notifications.notifySingleItemListed(
      owner,
      nft,
      tokenID,
      quantity,
      pricePerItem,
      paymentToken
    );
    return res.json({});
  } catch (error) {
    console.log("new item listed error");
    console.log(error);
    return res.json({ status: "failed" });
  }
});

router.post("/itemSold", service_auth, async (req, res) => {
  try {
    let seller = req.body.seller;
    let buyer = req.body.buyer;
    let nft = req.body.nft;
    let tokenID = parseInt(req.body.tokenID);
    let quantity = parseInt(req.body.quantity);
    let price = parseFloat(req.body.price);
    let paymentToken = toLowerCase(req.body.paymentToken);
    let priceInUSD = price * getPrice(paymentToken);
    // update last sale price
    // first update the token price

    console.log("item sold");
    console.log(seller, buyer, nft, tokenID, quantity, price, paymentToken);
    let category = await Category.findOne({ minterAddress: nft });

    if (category) {
      let token = await NFTITEM.findOne({
        contractAddress: nft,
        tokenID: tokenID,
      });
      if (token) {
        token.price = price;
        token.paymentToken = paymentToken;
        token.priceInUSD = priceInUSD;
        token.lastSalePrice = price;
        token.lastSalePricePaymentToken = paymentToken;
        token.lastSalePriceInUSD = priceInUSD;
        token.soldAt = new Date(); //set recently sold date
        token.listedAt = new Date(1970, 1, 1); //remove listed date
        await token.save();
      }
      // send mail here to buyer first
      let account = await Account.findOne({ address: buyer });
      // checks if user listens
      let ns = await NotificationSetting.findOne({ address: buyer });
      if (account && ns.sNftBuy) {
        let to = account.email;
        let alias = account.alias;
        let collectionName = await getCollectionName(nft);
        let tokenName = await getNFTItemName(nft, tokenID);
        let data = {
          type: "sale",
          to: to,
          isBuyer: true,
          event: "ItemSold",
          subject: "You have purchased an NFT Item!",
          alias: alias,
          collectionName: collectionName,
          tokenName: tokenName,
          tokenID: tokenID,
          nftAddress: nft,
          price: price,
          paymentToken: paymentToken,
          priceInUSD: priceInUSD,
        };
        sendEmail(data);
      }
      // checks if user listens
      account = await Account.findOne({ address: seller });
      ns = await NotificationSetting.findOne({ address: seller });
      if (account && ns.sNftSell) {
        let to = account.email;
        let alias = account.alias;
        let collectionName = await getCollectionName(nft);
        let tokenName = await getNFTItemName(nft, tokenID);
        let data = {
          type: "sale",
          to: to,
          isBuyer: false,
          event: "ItemSold",
          subject: "You have sold out an NFT Item!",
          alias: alias,
          collectionName: collectionName,
          tokenName: tokenName,
          tokenID: tokenID,
          nftAddress: nft,
          price: price,
          paymentToken: paymentToken,
          priceInUSD: priceInUSD,
        };
        sendEmail(data);
      }
    }

    try {
      // add new trade history
      let history = new TradeHistory();
      history.collectionAddress = nft;
      history.from = seller;
      history.to = buyer;
      history.tokenID = tokenID;
      history.price = price;
      history.paymentToken = paymentToken;
      history.priceInUSD = priceInUSD;
      history.value = quantity;
      await history.save();
    } catch (error) {
      console.log("error in saving trade history");
      console.log(error);
    }
    try {
      // remove from listing
      await Listing.deleteMany({
        owner: seller,
        minter: nft,
        tokenID: tokenID,
      });
    } catch (error) {
      console.log("error in removing listing");
      console.log(error);
    }
    return res.json({});
  } catch (error) {
    console.log("error in api call");
    console.log(error);
    return res.json({ status: "failed" });
  }
});
//   item updated

router.post("/itemUpdated", service_auth, async (req, res) => {
  try {
    let owner = req.body.owner;
    let nft = req.body.nft;
    let tokenID = parseInt(req.body.tokenID);
    let price = parseFloat(req.body.price);
    let paymentToken = toLowerCase(req.body.paymentToken);
    // update the price of the nft here
    // first update the token price
    let category = await Category.findOne({ minterAddress: nft });
    if (category) {
      let token = await NFTITEM.findOne({
        contractAddress: nft,
        tokenID: tokenID,
      });
      if (token) {
        token.price = price;
        token.paymentToken = paymentToken;
        await token.save();
      }
    }
    // update price from listing
    let list = await Listing.findOne({
      owner: owner,
      minter: nft,
      tokenID: tokenID,
    });
    if (list) {
      list.price = price;
      list.paymentToken = paymentToken;
      await list.save();
    }

    // send notification
    notifications.nofityNFTUpdated(owner, nft, tokenID, price, paymentToken);
    return res.json({});
  } catch (error) {
    return res.json({ status: "failed" });
  }
});

router.post("/itemCanceled", service_auth, async (req, res) => {
  try {
    let owner = req.body.owner;
    let nft = req.body.nft;
    let tokenID = req.body.tokenID;
    tokenID = parseInt(tokenID);
    let category = await Category.findOne({ minterAddress: nft });
    if (category) {
      let token = await NFTITEM.findOne({
        contractAddress: nft,
        tokenID: tokenID,
      });
      if (token) {
        token.price = token.lastSalePrice;
        token.paymentToken = token.lastSalePricePaymentToken;
        token.priceInUSD = token.lastSalePriceInUSD;
        token.listedAt = new Date(1970, 1, 1); //remove listed date
        await token.save();
      }
    }
    try {
      // remove from listing
      await Listing.deleteMany({
        owner: owner,
        minter: nft,
        tokenID: tokenID,
      });
    } catch (error) {}
    return res.json({});
  } catch (error) {
    return res.json({ status: "failed" });
  }
});

router.post("/offerCreated", service_auth, async (req, res) => {
  try {
    let creator = req.body.creator;
    let nft = req.body.nft;
    let tokenID = parseInt(req.body.tokenID);
    let quantity = parseInt(req.body.quantity);
    let pricePerItem = parseFloat(req.body.pricePerItem);
    let paymentToken = toLowerCase(req.body.paymentToken);
    let priceInUSD = pricePerItem * getPrice(paymentToken);
    let deadline = parseFloat(req.body.deadline);

    try {
      await Offer.deleteMany({
        creator: creator,
        minter: nft,
        tokenID: tokenID,
      });
      let offer = new Offer();
      offer.creator = creator;
      offer.minter = nft;
      offer.tokenID = tokenID;
      offer.quantity = quantity;
      offer.pricePerItem = pricePerItem;
      offer.paymentToken = paymentToken;
      offer.priceInUSD = priceInUSD;
      offer.deadline = deadline;
      await offer.save();
    } catch (error) {}
    // now send email to the owner
    try {
      let category = await Category.findOne({ minterAddress: nft });
      if (category) {
        let type = parseInt(category.type);
        if (type == 721) {
          let tokenOwner = await NFTITEM.findOne({
            contractAddress: nft,
            tokenID: tokenID,
          });
          let owner = await Account.findOne({
            address: tokenOwner.owner,
          });
          // checks if user listens
          let ns = await NotificationSetting.findOne({
            address: tokenOwner.owner,
          });
          if (owner && ns.sNftOffer) {
            let alias = await getUserAlias(owner.address);
            let tokenName = await getNFTItemName(nft, tokenID);
            let creatorAlias = await getUserAlias(creator);
            let collectionName = await getCollectionName(nft);
            let data = {
              type: 721,
              to: owner.email,
              from: creatorAlias,
              isBuyer: false,
              event: "OfferCreated",
              subject: "You received an Offer!",
              alias: alias,
              collectionName: collectionName,
              tokenName: tokenName,
              tokenID: tokenID,
              nftAddress: nft,
              price: pricePerItem,
              paymentToken: paymentToken,
              priceInUSD: priceInUSD,
            };
            sendEmail(data);
          }
        } else if (category == 1155) {
        }
      }
    } catch (error) {}
    return res.json({});
  } catch (error) {
    return res.json({ status: "failed" });
  }
});

router.post("/offerCanceled", service_auth, async (req, res) => {
  try {
    let creator = req.body.creator;
    let nft = req.body.nft;
    let tokenID = req.body.tokenID;
    tokenID = parseInt(tokenID);
    try {
      await Offer.deleteMany({
        creator: creator,
        minter: nft,
        tokenID: tokenID,
      });
    } catch (error) {}
    // now send email
    try {
      let category = await Category.findOne({ minterAddress: nft });
      if (category) {
        let type = parseInt(category.type);
        if (type == 721) {
          let tokenOwner = await NFTITEM.findOne({
            contractAddress: nft,
            tokenID: tokenID,
          });
          let owner = await Account.findOne({
            address: tokenOwner.owner,
          });
          // checks if user listens
          let ns = await NotificationSetting.findOne({
            address: tokenOwner.owner,
          });
          if (owner && ns.sNftOfferCancel) {
            let isNotifiable = await isOfferCancelNotifiable(
              owner.address,
              nft,
              tokenID
            );
            if (!isNotifiable) return;
            let alias = await getUserAlias(owner.address);
            let tokenName = await getNFTItemName(nft, tokenID);
            let creatorAlias = await getUserAlias(creator);
            let collectionName = await getCollectionName(nft);
            let data = {
              type: 721,
              to: owner.email,
              from: creatorAlias,
              isBuyer: false,
              event: "OfferCanceled",
              subject: "Offer has been withdrawn for your item!",
              alias: alias,
              collectionName: collectionName,
              tokenName: tokenName,
              tokenID: tokenID,
              nftAddress: nft,
            };
            if (creatorAlias != alias) sendEmail(data);
          }
        } else if (category == 1155) {
        }
      }
    } catch (error) {}
    return res.json({});
  } catch (error) {
    return res.json({ status: "failed" });
  }
});

module.exports = router;
