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
//
// })

router.post("/itemListed", service_auth, async (req, res) => {
  try {
    const { args, blockNumber, transactionHash } = req.body;
    const [ ownerC, nftC, tokenIdBN, quantityBN, paytokenC, pricePerItemBN, startingTimeBN ] = args;

    const owner = ownerC.toLowerCase();
    const nft = nftC.toLowerCase();
    const itemPayToken = [...PAYTOKENS, ...DISABLED_PAYTOKENS].find((token) => token.address.toLowerCase() === paytokenC.toLowerCase());
    const pricePerItem = ethers.utils.formatUnits(ethers.BigNumber.from(pricePerItemBN.hex), itemPayToken.decimals);
    const tokenId = parseInt(tokenIdBN.hex);
    const quantity = parseInt(quantityBN.hex);
    const startingTime = parseInt(startingTimeBN.hex) * 1000;
    const priceInUSD = pricePerItem * getPrice(itemPayToken.address);

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
        token.paymentToken = itemPayToken.address;
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
        newList.paymentToken = itemPayToken.address;
        newList.priceInUSD = priceInUSD;
        newList.startTime = startingTime;
        newList.blockNumber = blockNumber;
        await newList.save();
      }
    } catch (err) {
      console.error("[ItemListed] failed to save new listing: ", err.message);
    }
    // now notify followers
    try {
      await notifications.notifySingleItemListed(
        owner,
        nft,
        tokenId,
        quantity,
        pricePerItem,
        itemPayToken.address
      );
    } catch(err) {
      console.error("[ItemListed] Failed to notify followers: ", err.message);
    }

    console.info("[ItemListed] Success: ", { transactionHash, blockNumber });
    return res.json({status: "success"});
  } catch (error) {
    console.info("[ItemListed] Failed: ", { transactionHash: req.body.transactionHash, blockNumber: req.body.blockNumber });
    console.error({ error });

    return res.status(400).json({ status: "failed", error });
  }
});

router.post("/itemSold", service_auth, async (req, res) => {
  try {
    const { args, blockNumber, transactionHash } = req.body;
    const [ sellerC, buyerC, nftC, tokenIdBN, quantityBN, paytokenC, unitPriceBN, pricePerItemBN ] = args;

    const seller = sellerC.toLowerCase();
    const buyer = buyerC.toLowerCase();
    const nft = nftC.toLowerCase();
    const itemPayToken = [...PAYTOKENS, ...DISABLED_PAYTOKENS].find((token) => token.address.toLowerCase() === paytokenC.toLowerCase());
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
        token.price = 0;
        token.paymentToken = "ftm";
        token.priceInUSD = 0;
        token.lastSalePrice = pricePerItem;
        token.lastSalePricePaymentToken = itemPayToken.address;
        token.lastSalePriceInUSD = priceInUSD;
        token.listedAt = new Date(0);
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
            paymentToken: itemPayToken.address,
            priceInUSD: priceInUSD,
          };
          await sendEmail(data);
        }
      } catch (err) {
        console.error("[ItemSold] Failed to notify buyer: ", err.message)
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
            paymentToken: itemPayToken.address,
            priceInUSD: priceInUSD,
          };
          await sendEmail(data);
        }
      } catch (err) {
        console.error("[ItemSold] Failed to notify seller: ", err.message);
      }
    }

      // add new trade history
    try {
      const existingHistory = await TradeHistory.find({ txHash: transactionHash });
      if (!existingHistory.length) {
        history = new TradeHistory();
        history.collectionAddress = nft;
        history.from = seller;
        history.to = buyer;
        history.tokenID = tokenId;
        history.price = pricePerItem;
        history.paymentToken = itemPayToken.address;
        history.priceInUSD = priceInUSD;
        history.value = quantity;
        history.txHash = transactionHash;
        await history.save();
      }
    } catch (err) {
      console.error("[ItemSold] Failed to save new TradeHistory: ", err.message)
    }

    // remove from listing
    await Listing.deleteMany({
      owner: seller,
      minter: nft,
      tokenID: tokenId,
      blockNumber: { $lte: blockNumber}
    });

    console.info("[ItemSold] Success: ", { transactionHash, blockNumber });
    return res.json({status: "success"});
  } catch (error) {
    console.info("[ItemSold] Failed: ", { transactionHash: req.body.transactionHash, blockNumber: req.body.blockNumber });
    console.error({ error });

    return res.status(400).json({ status: "failed", error });
  }
});
//   item updated

router.post("/itemUpdated", service_auth, async (req, res) => {
  try {
    const {args, blockNumber, transactionHash } = req.body;
    const [ownerC, nftC, tokenIdBN, paytokenC, newPricePerItemBN] = args;

    const owner = ownerC.toLowerCase();
    const nft = nftC.toLowerCase();
    const itemPayToken = [...PAYTOKENS, ...DISABLED_PAYTOKENS].find((token) => token.address.toLowerCase() === paytokenC.toLowerCase());
    const newPricePerItem = ethers.utils.formatUnits(ethers.BigNumber.from(newPricePerItemBN.hex), itemPayToken.decimals);
    const tokenId = parseInt(tokenIdBN.hex);
    const newPriceInUSD = newPricePerItem * getPrice(itemPayToken.address);

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
        token.paymentToken = itemPayToken.address;
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
      list.paymentToken = itemPayToken.address;
      list.priceInUSD = newPriceInUSD;
      list.blockNumber = blockNumber;
      await list.save();
    }

    try {
      // send notification
      await notifications.nofityNFTUpdated(owner, nft, tokenId, newPricePerItem, itemPayToken.address);
    } catch (err) {
      console.error("[ItemUpdated] Failed to notify owner", err.message);
    }

    console.info("[ItemUpdated] Success: ", { transactionHash, blockNumber });
    return res.json({status: "success"});
  } catch (error) {
    console.info("[ItemUpdated] Failed: ", { transactionHash: req.body.transactionHash, blockNumber: req.body.blockNumber });
    console.error({ error });

    return res.status(400).json({ status: "failed", error });
  }
});

router.post("/itemCanceled", service_auth, async (req, res) => {
  try {
    const {args, blockNumber, transactionHash} = req.body;
    const [ownerC, nftC, tokenIdBN] = args;

    const owner = ownerC.toLowerCase();
    const nft = nftC.toLowerCase();
    const tokenId = parseInt(tokenIdBN.hex);

    let category = await Category.findOne({ minterAddress: nft });
    if (category) {
      let token = await NFTITEM.findOne({
        contractAddress: nft,
        tokenID: tokenId,
        blockNumber: {$lt: blockNumber},
      });
      if (token) {
        token.price = 0;
        token.paymentToken = "ftm";
        token.priceInUSD = 0;
        token.listedAt = new Date(0);
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

    console.info("[ItemCanceled] Success: ", { transactionHash, blockNumber });
    return res.json({status: "success"});
  } catch (error) {
    console.info("[ItemCanceled] Failed!: ", { transactionHash: req.body.transactionHash, blockNumber: req.body.blockNumber });
    console.error({ error });

    return res.status(400).json({ status: "failed", error });
  }
});

router.post("/offerCreated", service_auth, async (req, res) => {
  try {
    const {args, blockNumber, transactionHash} = req.body;
    const [creatorC, nftC, tokenIdBN, quantityBN, paytokenC, pricePerItemBN, deadlineBN] = args;

    const creator = creatorC.toLowerCase();
    const nft = nftC.toLowerCase();
    const itemPayToken = [...PAYTOKENS, ...DISABLED_PAYTOKENS].find((token) => token.address.toLowerCase() === paytokenC.toLowerCase());
    const pricePerItem = ethers.utils.formatUnits(ethers.BigNumber.from(pricePerItemBN.hex), itemPayToken.decimals);
    const tokenId = parseInt(tokenIdBN.hex);
    const quantity = parseInt(quantityBN.hex);
    const deadline = parseInt(deadlineBN.hex) * 1000;
    let priceInUSD = pricePerItem * getPrice(itemPayToken.address);

    try {
      await Offer.deleteMany({
        creator: creator,
        minter: nft,
        tokenID: tokenId,
        blockNumber: {$lt: blockNumber},
      });

      const existingOffer = await Offer.find({
        creator: creator,
        minter: nft,
        tokenID: tokenId,
      });

      if (!existingOffer.length) {
        const offer = new Offer();
        offer.creator = creator;
        offer.minter = nft;
        offer.tokenID = tokenId;
        offer.quantity = quantity;
        offer.pricePerItem = pricePerItem;
        offer.paymentToken = itemPayToken.address;
        offer.priceInUSD = priceInUSD;
        offer.deadline = deadline;
        offer.blockNumber = blockNumber;
        await offer.save();
      }
    } catch (error) {
      console.error("[OfferCreated] Failed to create new offer: ", error.message);
    }
    // now send email to the owner
    try {
      const category = await Category.findOne({ minterAddress: nft });
      if (category) {
        let type = parseInt(category.type);
        if (type == 721) {
          let tokenOwner = await NFTITEM.findOne({
            contractAddress: nft,
            tokenID: tokenId,
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
            let tokenName = await getNFTItemName(nft, tokenId);
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
              tokenID: tokenId,
              nftAddress: nft,
              price: pricePerItem,
              paymentToken: itemPayToken.address,
              priceInUSD: priceInUSD,
            };
            await sendEmail(data);
          }
        } else if (category == 1155) {
          //TODO: is 1155 working yet?
        }
      }
    } catch (error) {
      console.error("[OfferCreated] Failed to notify owner ", error.message)
    }

    console.info("[OfferCreated] Success: ", { transactionHash, blockNumber });
    return res.json({status: "success"});
  } catch (error) {
    console.info("[OfferCreated] Failed!: ", { transactionHash: req.body.transactionHash, blockNumber: req.body.blockNumber });
    console.error({ error });

    return res.status(400).json({ status: "failed", error });
  }
});

router.post("/offerCanceled", service_auth, async (req, res) => {
  try {
    const {args, blockNumber, transactionHash} = req.body;
    const [creatorC, nftC, tokenIdBN] = args;

    const creator = creatorC.toLowerCase();
    const nft = nftC.toLowerCase();
    const tokenId = parseInt(tokenIdBN.hex);

    await Offer.deleteMany({
      creator: creator,
      minter: nft,
      tokenID: tokenId,
      blockNumber: {$lt: blockNumber},
    });

    // now send email
    try {
      let category = await Category.findOne({ minterAddress: nft });
      if (category) {
        let type = parseInt(category.type);
        if (type == 721) {
          let tokenOwner = await NFTITEM.findOne({
            contractAddress: nft,
            tokenID: tokenId,
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
              tokenId
            );
            if (!isNotifiable) return;
            let alias = await getUserAlias(owner.address);
            let tokenName = await getNFTItemName(nft, tokenId);
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
              tokenID: tokenId,
              nftAddress: nft,
            };
            if (creatorAlias != alias) await sendEmail(data);
          }
        } else if (category == 1155) {
        }
      }
    } catch (error) {
      console.error("[OfferCanceled] Failed to notify owner ", error.message)
    }

    console.info("[OfferCanceled] Success: ", { transactionHash, blockNumber });
    return res.json({status: "success"});
  } catch (error) {
    console.info("[OfferCanceled] Failed!: ", { transactionHash: req.body.transactionHash, blockNumber: req.body.blockNumber });
    console.error({ error });

    return res.status(400).json({ status: "failed", error });
  }
});

module.exports = router;
