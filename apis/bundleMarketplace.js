require("dotenv").config();
const mongoose = require("mongoose");
const BundleListing = mongoose.model("BundleListing");
const BundleTradeHistory = mongoose.model("BundleTradeHistory");
const Bundle = mongoose.model("Bundle");
const BundleInfo = mongoose.model("BundleInfo");
const BundleOffer = mongoose.model("BundleOffer");
const Account = mongoose.model("Account");
const Category = mongoose.model("Category");
const NFTITEM = mongoose.model("NFTITEM");
const NotificationSetting = mongoose.model("NotificationSetting");

const router = require("express").Router();
const service_auth = require("./middleware/auth.tracker");
const sendEmail = require("../mailer/bundleMailer");
const notifications = require("../mailer/followMailer");
const { getPrice } = require("../services/price.feed");
const toLowerCase = require("../utils/utils");

// check if nft is erc721 or 1155
const getTokenType = async (address) => {
  let tokenTypes = await Category.find();
  tokenTypes = tokenTypes.map((tt) => [tt.minterAddress, tt.type]);
  let tokenCategory = tokenTypes.filter((tokenType) => tokenType[0] == address);
  tokenCategory = tokenCategory[0];
  return parseInt(tokenCategory[1]);
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

router.post("/itemListed", service_auth, async (req, res) => {
  try {
    let bundleID = req.body.bundleID;
    let owner = req.body.owner;
    let price = parseFloat(req.body.price);
    let paymentToken = toLowerCase(req.body.paymentToken);
    let priceInUSD = price * getPrice(paymentToken);
    let startingTime = parseFloat(req.body.startingTime);

    //   update bundle's list time & price
    let bundle = await Bundle.findById(bundleID);
    let bundleName = bundle.name;
    bundle.price = price;
    bundle.paymentToken = paymentToken;
    bundle.priceInUSD = priceInUSD;
    bundle.listedAt = Date.now();
    await bundle.save();

    // save the new listing
    let listing = new BundleListing();
    listing.bundleID = bundleID;
    listing.owner = owner;
    listing.price = price;
    listing.paymentToken = paymentToken;
    listing.priceInUSD = priceInUSD;
    listing.startTime = startingTime;
    await listing.save();

    // now add the bundle trade history
    let history = new BundleTradeHistory();
    history.bundleID = bundleID;
    history.creator = owner;
    history.from = owner;
    history.price = price;
    history.paymentToken = paymentToken;
    history.priceInUSD = priceInUSD;
    history.activity = "List";
    history.createdAt = Date.now();
    await history.save();
    // notify follower
    notifications.notifyBundleListing(
      bundleID,
      bundleName,
      owner,
      price,
      paymentToken
    );
    return res.json({});
  } catch (error) {
    return res.json({ status: "failed" });
  }
});

router.post("/itemSold", service_auth, async (req, res) => {
  try {
    let seller = req.body.seller;
    let buyer = req.body.buyer;
    let bundleID = req.body.bundleID;
    let price = parseFloat(req.body.price);
    let paymentToken = toLowerCase(req.body.paymentToken);
    let priceInUSD = price * getPrice(paymentToken);

    // first update the bundle owner
    let bundle = await Bundle.findById(bundleID);
    bundle.owner = buyer;
    bundle.price = price;
    bundle.paymentToken = paymentToken;
    bundle.priceInUSD = priceInUSD;
    bundle.lastSalePrice = price;
    bundle.lastSalePricePaymentToken = paymentToken;
    bundle.lastSalePriceInUSD = priceInUSD;
    bundle.soldAt = Date.now();
    bundle.listedAt = new Date(1970, 1, 1);
    bundle.saleEndsAt = new Date(1970, 1, 1);
    await bundle.save();
    // second add trade history
    let history = new BundleTradeHistory();
    history.bundleID = bundleID;
    history.from = seller;
    history.to = buyer;
    history.price = price;
    history.paymentToken = paymentToken;
    history.priceInUSD = priceInUSD;
    history.activity = "Sale";
    history.createdAt = Date.now();
    await history.save();
    // remove from bundle listing
    await BundleListing.deleteMany({
      bundleID: bundleID,
    });
    // send an email to seller & buyer
    // seller
    try {
      let account = await Account.findOne({
        address: seller,
      });
      // check if user listens
      let ns = await NotificationSetting.findOne({ address: seller });
      if (account && ns.sBundleSell) {
        let to = account.email;
        let sellerAlias = await getUserAlias(seller);
        let bundleName = bundle.name;
        let data = {
          to,
          alias: sellerAlias,
          event: "ItemSold",
          price: price,
          bundleID,
          bundleName,
          paymentToken,
          isBuyer: false,
        };
        sendEmail(data);
      }
    } catch (error) {}
    // buyer
    try {
      let account = await Account.findOne({
        address: buyer,
      });
      // check if user listens
      let ns = await NotificationSetting.findOne({ address: buyer });
      if (account && ns.sBundleBuy) {
        let to = account.email;
        let buyerAlias = await getUserAlias(buyer);
        let bundleName = bundle.name;

        let data = {
          to,
          alias: buyerAlias,
          event: "ItemSold",
          buyer: buyerAlias,
          price: price,
          bundleID,
          bundleName,
          paymentToken,
          isBuyer: true,
        };
        sendEmail(data);
      }
    } catch (error) {}

    return res.json({});
  } catch (error) {
    return res.json({ status: "failed" });
  }
});

router.post("/itemUpdated", service_auth, async (req, res) => {
  try {
    let owner = req.body.owner;
    let bundleID = req.body.bundleID;
    let nfts = req.body.nft;
    let tokenIDs = req.body.tokenID;
    let quantities = req.body.quantity;
    let newPrice = parseFloat(req.body.newPrice);
    let paymentToken = toLowerCase(req.body.paymentToken);
    let priceInUSD = newPrice * getPrice(paymentToken);
    if (nfts.length == 0) {
      await Bundle.deleteOne({ _id: bundleID });
      await BundleInfo.deleteMany({ bundleID: bundleID });
    } else {
      // update bundle info
      let bundle = await Bundle.findById(bundleID);
      let bundleName = bundle.name;
      let oldPrice = bundle.price;
      bundle.price = newPrice;
      bundle.paymentToken = paymentToken;
      bundle.priceInUSD = priceInUSD;
      await bundle.save();

      // first remove all bundle info with the bundle's id
      await BundleInfo.deleteMany({ bundleID: bundleID });

      // now create new bundle infos
      let promise = nfts.map(async (_, index) => {
        let address = nfts[index];
        let tokenID = parseInt(tokenIDs[index]);
        let supply = parseInt(quantities[index]);
        let tokenType = await getTokenType(address);

        let bundleItem = new BundleInfo();
        bundleItem.contractAddress = address;
        bundleItem.bundleID = bundleID;
        bundleItem.tokenID = tokenID;
        bundleItem.supply = supply;
        bundleItem.tokenType = tokenType;

        let token = await NFTITEM.findOne({
          contractAddress: address,
          tokenID: tokenID,
        });
        let tokenURI = token.tokenURI;
        bundleItem.tokenURI = tokenURI;
        await bundleItem.save();
      });
      await Promise.all(promise);

      console.log(`new price, old price ${newPrice}, ${oldPrice}`);
      // notify
      if (oldPrice != newPrice)
        notifications.notifyBundleUpdate(
          bundleID,
          bundleName,
          owner,
          newPrice,
          paymentToken
        );
    }
    return res.json({});
  } catch (error) {
    console.log("bundle item udpate");
    console.log(error);
    return res.json({ status: "failed" });
  }
});

router.post("/itemCanceled", service_auth, async (req, res) => {
  try {
    let owner = req.body.owner;
    let bundleID = req.body.bundleID;

    // remove from bundle listing
    await BundleListing.deleteMany({
      bundleID: bundleID,
    });
    // update bundle's list related values
    let bundle = await Bundle.findById(bundleID);
    bundle.price = bundle.lastSalePrice;
    bundle.paymentToken = bundle.lastSalePricePaymentToken;
    bundle.priceInUSD = bundle.lastSalePriceInUSD;
    bundle.listedAt = new Date(1970, 1, 1);
    bundle.saleEndsAt = new Date(1970, 1, 1);
    await bundle.save();
    return res.json({});
  } catch (error) {
    return res.json({ status: "failed" });
  }
});

router.post("/offerCreated", service_auth, async (req, res) => {
  try {
    let creator = req.body.creator;
    let bundleID = req.body.bundleID;
    let price = parseFloat(req.body.price);
    let paymentToken = toLowerCase(req.body.paymentToken);
    let priceInUSD = price * getPrice(paymentToken);
    let deadline = parseFloat(req.body.deadline);

    // create new bundle offer
    let offer = new BundleOffer();
    offer.bundleID = bundleID;
    offer.creator = creator;
    offer.price = price;
    offer.paymentToken = paymentToken;
    offer.priceInUSD = priceInUSD;
    offer.deadline = deadline;
    await offer.save();
    // send mail to owner
    try {
      let bundle = await Bundle.findById(bundleID);
      let owner = bundle.owner;
      let bundleName = bundle.name;
      let ownerAccount = await Account.findOne({
        address: owner,
      });
      // check if user listens
      let ns = await NotificationSetting.findOne({ address: owner });
      if (ownerAccount && ns.sBundleOffer) {
        let to = ownerAccount.email;
        let ownerAlias = await getUserAlias(owner);
        let creatorAlias = await getUserAlias(creator);
        let data = {
          to,
          alias: ownerAlias,
          event: "OfferCreated",
          from: creatorAlias,
          bundleName,
          price,
          paymentToken,
        };
        sendEmail(data);
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
    let bundleID = req.body.bundleID;

    // remove bundle offer
    await BundleOffer.deleteMany({
      bundleID: bundleID,
    });

    try {
      let bundle = await Bundle.findById(bundleID);
      let owner = bundle.owner;
      let bundleName = bundle.name;
      let ownerAccount = await Account.findOne({
        address: owner,
      });
      // check if user listens
      let ns = await NotificationSetting.findOne({ address: owner });
      if (ownerAccount && ns.sBundleOfferCancel) {
        let to = ownerAccount.email;
        let ownerAlias = await getUserAlias(owner);
        let creatorAlias = await getUserAlias(creator);
        let data = {
          to,
          alias: ownerAlias,
          event: "OfferCanceled",
          from: creatorAlias,
          bundleName,
        };
        sendEmail(data);
      }
    } catch (error) {}

    // send email to the owner
    return res.json({});
  } catch (error) {
    return res.json({ status: "failed" });
  }
});

module.exports = router;
