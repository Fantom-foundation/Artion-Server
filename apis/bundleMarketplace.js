require("dotenv").config();
const mongoose = require("mongoose");
const BundleListing = mongoose.model("BundleListing");
const BundleTradeHistory = mongoose.model("BundleTradeHistory");
const Bundle = mongoose.model("Bundle");
const BundleInfo = mongoose.model("BundleInfo");
const BundleOffer = mongoose.model("BundleOffer");

const Category = mongoose.model("Category");
const NFTITEM = mongoose.model("NFTITEM");

const router = require("express").Router();
const service_auth = require("./middleware/auth.tracker");
const sendEmail = require("../mailer/bundleMailer");

const toLowerCase = (val) => {
  if (val) return val.toLowerCase();
  else return val;
};
const parseToFTM = (inWei) => {
  return parseFloat(inWei.toString()) / 10 ** 18;
};

// check if nft is erc721 or 1155
const getTokenType = async (address) => {
  let tokenTypes = await Category.find();
  tokenTypes = tokenTypes.map((tt) => [tt.minterAddress, tt.type]);
  let tokenCategory = tokenTypes.filter((tokenType) => tokenType[0] == address);
  tokenCategory = tokenCategory[0];
  return parseInt(tokenCategory[1]);
};

const convertTime = (value) => {
  return parseFloat(value) * 1000;
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

router.post("itemListed", service_auth, async (req, res) => {
  try {
    let bundleID = req.body.bundleID;
    let owner = toLowerCase(req.body.owner);
    let price = parseToFTM(req.body.price);
    let startingTime = convertTime(req.body.startingTime);

    //   update bundle's list time & price
    let bundle = await Bundle.findById(bundleID);
    bundle.price = price;
    bundle.listedAt = Date.now();
    await bundle.save();
    // save the new listing
    let listing = new BundleListing();
    listing.bundleID = bundleID;
    listing.owner = owner;
    listing.price = price;
    listing.startTime = startingTime;
    await listing.save();

    // now add the bundle trade history
    let history = new BundleTradeHistory();
    history.bundleID = bundleID;
    history.creator = owner;
    history.from = owner;
    history.price = price;
    history.activity = "List";
    history.createdAt = Date.now();
    await history.save();
  } catch (error) {
    return res.status(400).json({});
  } finally {
    return res.json({});
  }
});

router.post("/itemSold", service_auth, async (req, res) => {
  try {
    let seller = toLowerCase(req.body.seller);
    let buyer = toLowerCase(req.body.buyer);
    let bundleID = req.body.bundleID;
    let price = parseToFTM(req.body.price);

    // first update the bundle owner
    let bundle = await Bundle.findById(bundleID);
    bundle.owner = buyer;
    bundle.price = price;
    bundle.lastSalePrice = price;
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
    history.activity = "Sale";
    history.createdAt = Date.now();
    await history.save();
    await history.save();
  } catch (error) {
    return res.status(400).json({});
  } finally {
    return res.json({});
  }
});

router.post("/itemUpdated", service_auth, async (req, res) => {
  try {
    let owner = toLowerCase(req.body.owner);
    let bundleID = req.body.bundleID;
    let nfts = req.body.nft;
    let tokenIDs = req.body.tokenID;
    let quantities = req.body.quantity;
    let newPrice = parseToFTM(req.body.newPrice);

    // update bundle info
    if (newPrice) {
      let bundle = await Bundle.findById(bundleID);
      bundle.price = newPrice;
      await bundle.save();
    }

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
  } catch (error) {
    return res.status(400).json({});
  } finally {
    return res.json({});
  }
});

router.post("/itemCanceled", service_auth, async (req, res) => {
  try {
    let owner = toLowerCase(req.body.owner);
    let bundleID = req.body.bundleID;

    // remove from bundle listing
    await BundleListing.deleteMany({
      bundleID: bundleID,
    });
    // update bundle's list related values
    let bundle = await Bundle.findById(bundleID);
    bundle.price = bundle.lastSalePrice;
    bundle.listedAt = new Date(1970, 1, 1);
    bundle.saleEndsAt = new Date(1970, 1, 1);
    await bundle.save();
  } catch (error) {
    return res.status(400).json({});
  } finally {
    return res.json({});
  }
});

router.post("/offerCreated", service_auth, async (req, res) => {
  try {
    let creator = toLowerCase(req.body.creator);
    let bundleID = req.body.bundleID;
    let price = parseToFTM(req.body.price);
    let deadline = convertTime(req.body.deadline);

    // create new bundle offer
    let offer = new BundleOffer();
    offer.bundleID = bundleID;
    offer.creator = creator;
    offer.price = price;
    offer.deadline = deadline;
    await offer.save();

    // send mail to owner
  } catch (error) {
    return res.status(400).json({});
  } finally {
    return res.json({});
  }
});

router.post("/offerCanceled", service_auth, async (req, res) => {
  try {
    let creator = toLowerCase(req.body.creator);
    let bundleID = req.body.bundleID;

    // remove bundle offer
    await BundleOffer.deleteMany({
      bundleID: bundleID,
    });

    // send email to the owner
  } catch (error) {
    return res.status(400).json({});
  } finally {
    return res.json({});
  }
});

module.exports = router;
