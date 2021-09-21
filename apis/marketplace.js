require("dotenv").config();
const mongoose = require("mongoose");
const router = require("express").Router();
const ethers = require("ethers");

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
const { PAYTOKENS, DISABLED_PAYTOKENS } = require('../constants/tokens');

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

// router.post("/test", service_auth, async (req, res) => {
//   const result = await Listing.find({
//     owner: owner,
//     minter: nft,
//     tokenID: tokenId,
//     blockNumber: { $lt: blockNumber }
//   });
//   console.log(result);
// })

router.post("/itemListed", service_auth, async (req, res) => {
  try {
    const { args, blockNumber } = req.body;
    const [ owner, nft, tokenIdBN, quantityBN, paytoken, pricePerItemBN, startingTimeBN ] = args;

    const itemPayToken = [...PAYTOKENS, ...DISABLED_PAYTOKENS].find((token) => token.address.toLowerCase() === paytoken.toLowerCase());
    const pricePerItem = ethers.utils.formatUnits(ethers.BigNumber.from(pricePerItemBN.hex), itemPayToken.decimals);
    const tokenId = parseInt(tokenIdBN.hex);
    const quantity = parseInt(quantityBN.hex);
    const startingTime = parseInt(startingTimeBN.hex) * 1000;


    // first update the token price
    let category = await Category.findOne({ minterAddress: nft });
    if (category) {
      let token = await NFTITEM.findOne({
        contractAddress: nft,
        tokenID: tokenId,
        blockNumber: { $lt: blockNumber }
      });
      if (token) {
        token.price = pricePerItem;
        token.paymentToken = itemPayToken.symbol;
        token.listedAt = new Date(); // set listed date
        token.blockNumber = blockNumber;
        await token.save();
      }
    }

    // remove if the a listing already exists
    await Listing.deleteMany({
      owner: owner,
      minter: nft,
      tokenID: tokenId,
      blockNumber: { $lt: blockNumber }
    });

    try {
      const existingListing = await Listing.find({
        owner: owner,
        minter: nft,
        tokenID: tokenId,
      });

      if (!existingListing.length) {
        const newList = new Listing();
        newList.owner = owner;
        newList.minter = nft;
        newList.tokenID = tokenId;
        newList.quantity = quantity;
        newList.price = pricePerItem;
        newList.paymentToken = itemPayToken.symbol;
        newList.startTime = startingTime;
        newList.blockNumber = blockNumber;
        await newList.save();
      }
    } catch (err) {
      console.error("[ListItem] failed to save listing: ", err.message);
    }
    // now notify followers
    try {
      await notifications.notifySingleItemListed(
        owner,
        nft,
        tokenId,
        quantity,
        pricePerItem,
        itemPayToken.symbol
      );
    } catch(err) {
      console.error("Failed to notify followers: ", err.message);
    }

    return res.json({status: "success"});
  } catch (error) {
    console.log("ItemListed error: ", { txHash: req.body.transactionHash });
    console.log({ error });

    return res.status(400).json({ status: "failed", error });
  }
});

router.post("/itemSold", service_auth, async (req, res) => {
  try {
    const { args, blockNumber, transactionHash } = req.body;
    const [ seller, buyer, nft, tokenIdBN, quantityBN, paytoken, unitPriceBN, pricePerItemBN ] = args;

    const itemPayToken = [...PAYTOKENS, ...DISABLED_PAYTOKENS].find((token) => token.address.toLowerCase() === paytoken.toLowerCase());
    const unitPrice = ethers.utils.formatUnits(ethers.BigNumber.from(unitPriceBN.hex), itemPayToken.decimals);
    const pricePerItem = ethers.utils.formatUnits(ethers.BigNumber.from(pricePerItemBN.hex), itemPayToken.decimals);
    const tokenId = parseInt(tokenIdBN.hex);
    const quantity = parseInt(quantityBN.hex);

    const priceInUSD = pricePerItem * getPrice(itemPayToken.address);

    // update last sale price
    // first update the token price
    let category = await Category.findOne({ minterAddress: nft });
    if (category) {
      let token = await NFTITEM.findOne({
        contractAddress: nft,
        tokenID: tokenId,
        blockNumber: { $lte: blockNumber },
      });
      if (token) {
        token.price = unitPrice;
        token.paymentToken = itemPayToken.symbol;
        token.priceInUSD = getPrice(itemPayToken.address);
        token.lastSalePrice = pricePerItem;
        token.lastSalePricePaymentToken = itemPayToken.symbol;
        token.lastSalePriceInUSD = priceInUSD;
        token.soldAt = new Date(); //set recently sold date
        await token.save();
      }

      try {
        // send mail here to buyer first
        let account = await Account.findOne({address: buyer});
        // checks if user listens
        let ns = await NotificationSetting.findOne({address: buyer});
        if (account && ns.sNftBuy) {
          let to = account.email;
          let alias = account.alias;
          let collectionName = await getCollectionName(nft);
          let tokenName = await getNFTItemName(nft, tokenId);
          let data = {
            type: "sale",
            to: to,
            isBuyer: true,
            event: "ItemSold",
            subject: "You have purchased an NFT Item!",
            alias: alias,
            collectionName: collectionName,
            tokenName: tokenName,
            tokenID: tokenId,
            nftAddress: nft,
            price: pricePerItem,
            paymentToken: itemPayToken.symbol,
            priceInUSD: priceInUSD,
          };
          sendEmail(data);
        }
      } catch (err) {
        console.error("Failed to notify buyer: ", err.message)
      }

      try {
        // checks if user listens
        const account = await Account.findOne({address: seller});
        const ns = await NotificationSetting.findOne({address: seller});
        if (account && ns.sNftSell) {
          let to = account.email;
          let alias = account.alias;
          let collectionName = await getCollectionName(nft);
          let tokenName = await getNFTItemName(nft, tokenId);
          let data = {
            type: "sale",
            to: to,
            isBuyer: false,
            event: "ItemSold",
            subject: "You have sold out an NFT Item!",
            alias: alias,
            collectionName: collectionName,
            tokenName: tokenName,
            tokenID: tokenId,
            nftAddress: nft,
            price: pricePerItem,
            paymentToken: itemPayToken.symbol,
            priceInUSD: priceInUSD,
          };
          sendEmail(data);
        }
      } catch (err) {
        console.error("Failed to notify seller: ", err.message);
      }
    }

      // add new trade history
    try {
      let existingHistory = await TradeHistory.find({ txHash: transactionHash });
      if (!existingHistory.length) {
        history = new TradeHistory();
        history.collectionAddress = nft;
        history.from = seller;
        history.to = buyer;
        history.tokenID = tokenId;
        history.price = pricePerItem;
        history.paymentToken = itemPayToken.symbol;
        history.priceInUSD = priceInUSD;
        history.value = quantity;
        history.txHash = transactionHash;
        await history.save();
      }
    } catch (err) {
      console.error("[ItemSold] Error inserting into tradehistory: ", err.message)
    }

    // remove from listing
    await Listing.deleteMany({
      owner: seller,
      minter: nft,
      tokenID: tokenId,
      blockNumber: { $lte: blockNumber}
    });

    return res.json({status: "success"});
  } catch (error) {
    console.log("ItemSold error: ", { txHash: req.body.transactionHash });
    console.log({ error });

    return res.status(400).json({ status: "failed", error });
  }
});
//   item updated

router.post("/itemUpdated", service_auth, async (req, res) => {
  try {
    const {args, blockNumber} = req.body;
    const [owner, nft, tokenIdBN, paytoken, newPricePerItemBN] = args;

    const itemPayToken = [...PAYTOKENS, ...DISABLED_PAYTOKENS].find((token) => token.address.toLowerCase() === paytoken.toLowerCase());
    const newPricePerItem = ethers.utils.formatUnits(ethers.BigNumber.from(newPricePerItemBN.hex), itemPayToken.decimals);
    const tokenId = parseInt(tokenIdBN.hex);

    // update the price of the nft here
    // first update the token price
    let category = await Category.findOne({minterAddress: nft});
    if (category) {
      let token = await NFTITEM.findOne({
        contractAddress: nft,
        tokenID: tokenId,
        blockNumber: {$lt: blockNumber}
      });
      if (token) {
        token.price = newPricePerItem;
        token.paymentToken = itemPayToken.symbol;
        await token.save();
      }
    }
    // update price from listing
    let list = await Listing.findOne({
      owner: owner,
      minter: nft,
      tokenID: tokenId,
      blockNumber: {$lt: blockNumber},
    });
    if (list) {
      list.price = newPricePerItem;
      list.paymentToken = itemPayToken.symbol;
      list.blockNumber = blockNumber;
      await list.save();
    }

    try {
      // send notification
      await notifications.nofityNFTUpdated(owner, nft, tokenId, newPricePerItem, itemPayToken.symbol);
    } catch (err) {
      console.error("Failed to notify owner", err.message);
    }

    return res.json({status: "success"});
  } catch (error) {
    console.log("ItemUpdated error: ", { txHash: req.body.transactionHash });
    console.log({ error });

    return res.status(400).json({ status: "failed", error });
  }
});

router.post("/itemCanceled", service_auth, async (req, res) => {
  try {
    const {args, blockNumber} = req.body;
    const [owner, nft, tokenIdBN] = args;

    const tokenId = parseInt(tokenIdBN.hex);

    let category = await Category.findOne({ minterAddress: nft });
    if (category) {
      let token = await NFTITEM.findOne({
        contractAddress: nft,
        tokenID: tokenId,
        blockNumber: {$lt: blockNumber},
      });
      if (token) {
        token.price = null;
        token.paymentToken = null;
        token.priceInUSD = null;
        token.listedAt = null; //remove listed date
        await token.save();
      }
    }
    // remove from listing
    await Listing.deleteMany({
      owner: owner,
      minter: nft,
      tokenID: tokenId,
      blockNumber: {$lt: blockNumber}
    });

    return res.json({status: "success"});
  } catch (error) {
    console.log("ItemCanceled error: ", { txHash: req.body.transactionHash });
    console.log({ error });

    return res.status(400).json({ status: "failed", error });
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
