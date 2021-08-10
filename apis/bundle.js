const router = require("express").Router();

const mongoose = require("mongoose");
const auth = require("./middleware/auth");
const service_auth = require("./middleware/auth.tracker");

const NFTITEM = mongoose.model("NFTITEM");
const Bundle = mongoose.model("Bundle");
const BundleInfo = mongoose.model("BundleInfo");
const ERC1155HOLDING = mongoose.model("ERC1155HOLDING");
const Category = mongoose.model("Category");
const Collection = mongoose.model("Collection");

const notifications = require("../mailer/followMailer");

const orderBy = require("lodash.orderby");
const toLowerCase = require("../utils/utils");

const extractAddress = require("../services/address.utils");
const { getPrice } = require("../services/price.feed");

router.post("/increaseViews", async (req, res) => {
  try {
    let bundleID = req.body.bundleID;
    let bundle = await Bundle.findById(bundleID);
    if (bundle) {
      bundle.viewed = bundle.viewed + 1;
      let _bundle = await bundle.save();
      return res.json({
        status: "success",
        data: _bundle.viewed,
      });
    } else {
      return res.status(400).json({
        status: "failed",
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: "failed",
    });
  }
});
// check if nft is erc721 or 1155
const getTokenType = async (address) => {
  let tokenTypes = await Category.find();
  tokenTypes = tokenTypes.map((tt) => [tt.minterAddress, tt.type]);
  let tokenCategory = tokenTypes.filter((tokenType) => tokenType[0] == address);
  tokenCategory = tokenCategory[0];
  return parseInt(tokenCategory[1]);
};

// check if the item can be added to a new bundle
const validateItem = async (owner, address, tokenID, supply, tokenType) => {
  if (tokenType == 721) {
    let token = await NFTITEM.findOne({
      owner: owner,
      contractAddress: address,
      tokenID: tokenID,
    });
    if (token) return true;
    else return false;
  } else if (tokenType == 1155) {
    let token = await ERC1155HOLDING.findOne({
      contractAddress: address,
      tokenID: tokenID,
      holderAddress: owner,
    });
    if (token) {
      if (parseInt(token.supplyPerHolder) >= supply) return true;
      else return false;
    } else return false;
  } else return false;
};

router.post("/createBundle", auth, async (req, res) => {
  try {
    let owner = extractAddress(req, res);
    let name = req.body.name;
    let price = parseFloat(req.body.price);
    let items = req.body.items;

    // add payment token option
    let paymentToken = toLowerCase(req.body.paymentToken);
    let priceInUSD = price * getPrice(paymentToken);
    if (priceInUSD == 0)
      return res.status(400).json({
        status: "failed",
        data: "Payment token not acceptable",
      });
    if (items.length == 0) {
      return res.status(400).json({
        status: "failed",
        data: "Cannot create an empty bundle",
      });
    }
    if (price <= 0) {
      return res.status(400).json({
        status: "failed",
        data: "Price cannot be under 0",
      });
    }
    // create a new bundle
    let bundle = new Bundle();
    bundle.name = name;
    bundle.price = price;
    bundle.paymentToken = paymentToken;
    bundle.priceInUSD = priceInUSD;
    bundle.owner = owner;
    bundle.creator = owner;
    bundle.createdAt = Date.now();
    bundle.listedAt = new Date(1970, 1, 1);
    let _bundle = await bundle.save();
    let bundleID = _bundle._id;

    let promise = items.map(async (item) => {
      let address = toLowerCase(item.address);
      let tokenID = parseInt(item.tokenID);
      let supply = parseInt(item.supply);
      let tokenType = await getTokenType(address);
      let isValid = await validateItem(
        owner,
        address,
        tokenID,
        supply,
        tokenType
      );
      if (!isValid)
        return res.status(400).json({
          status: "failed",
          data: `nft of ${address}' ${tokenID} is invalid to add to the bundle`,
        });

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
    notifications.notifyBundleCreation(owner, bundleID, name);
    return res.json({
      status: "success",
      data: bundleID,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      status: "failed",
    });
  }
});

router.post("/removeBundle", auth, async (req, res) => {
  try {
    let bundleID = req.body.bundleID;
    await Bundle.deleteOne({
      _id: bundleID,
    });
    await BundleInfo.deleteMany({
      bundleID: bundleID,
    });
    return res.json({
      status: "success",
    });
  } catch (error) {
    return res.status(400).json({
      status: "failed",
    });
  }
});

router.post("/getBundleByID", async (req, res) => {
  try {
    let bundleID = req.body.bundleID;
    let bundle = await Bundle.findById(bundleID);
    let bundleHoldings = await BundleInfo.find({
      bundleID: bundleID,
    });

    let items = [];
    let promise = bundleHoldings.map(async (holding) => {
      let contractAddress = holding.contractAddress;
      let tokenID = holding.tokenID;
      let token = await NFTITEM.findOne({
        contractAddress: contractAddress,
        tokenID: tokenID,
      });
      items.push({
        contractAddress: token.contractAddress,
        tokenID: token.tokenID,
        tokenURI: token.tokenURI,
        thumbnailPath: token.thumbnailPath,
        name: token.name,
        supply: holding.supply,
        contentType: token.contentType,
      });
    });
    await Promise.all(promise);
    return res.json({
      status: "success",
      data: {
        bundle,
        items,
      },
    });
  } catch (error) {
    return res.status(400).json({
      status: "failed",
    });
  }
});

router.post("/removeItemFromBundle", service_auth, async (req, res) => {
  try {
    let contractAddress = toLowerCase(req.body.nft);
    let tokenID = parseInt(req.body.tokenID);
    let quantity = parseInt(req.body.quantity);
    let owner = toLowerCase(req.body.seller);

    let bundles = await Bundle.find({
      owner: owner,
    });
    let bundleIDs = bundles.map((bundle) => bundle._id);
    let promise = bundleIDs.map(async (bundleID) => {
      await BundleInfo.update(
        {
          contractAddress: contractAddress,
          tokenID: tokenID,
          bundleID: bundleID,
        },
        {
          $inc: {
            supply: quantity * -1,
          },
        }
      );
      await BundleInfo.deleteMany({
        supply: 0,
      });
    });
    await Promise.all(promise);
    return res.json({
      status: "success",
    });
  } catch (error) {
    return res.status(400).json({
      status: "failed",
    });
  }
});

router.post("/fetchBundles", async (req, res) => {
  let tokenTypes = await Category.find();
  tokenTypes = tokenTypes.map((tt) => [tt.minterAddress, tt.type]);
  try {
    let collections2filter = null;
    // get options from request & process
    let step = parseInt(req.body.step); // step where to fetch
    let selectedCollections = req.body.collectionAddresses; //collection addresses from request
    let filters = req.body.filterby; //status -> array or null
    let sortby = req.body.sortby; //sort -> string param
    let category = req.body.category; //category -> array or null

    let wallet = req.body.address; // account address from meta mask

    if (!selectedCollections) selectedCollections = [];
    else {
      selectedCollections = selectedCollections.map((selectedCollection) =>
        toLowerCase(selectedCollection)
      );
      collections2filter = selectedCollections;
    }

    let categoryCollections = null;

    if (category != undefined) {
      categoryCollections = await Collection.find({
        categories: category,
      }).select("erc721Address");
      categoryCollections = categoryCollections.map((c) =>
        toLowerCase(c.erc721Address)
      );
      if (collections2filter != null) {
        collections2filter = collections2filter.filter((x) =>
          categoryCollections.includes(x)
        );
        if (collections2filter.length == 0) {
          // if not intersection between categoryfilter & collection filter => return null
          collections2filter = null;
          return res.json({
            status: "success",
            data: null,
          });
        }
      } else {
        collections2filter = categoryCollections;
      }
    }
    if (!wallet) {
      wallet = toLowerCase(wallet);
      if (filters == undefined) {
        let collection2Filters4BundleInfo = {
          ...(collections2filter != null
            ? { contractAddress: { $in: [...collections2filter] } }
            : {}),
        };

        let allBundleInfo = await BundleInfo.find(
          collection2Filters4BundleInfo
        );
      }
    }
  } catch (error) {
    return res.status(400).json({
      status: "failed",
    });
  }
});

const sortBundles = (_allBundles, sortby) => {
  let tmp = [];
  switch (sortby) {
    case "createdAt": {
      tmp = orderBy(
        _allBundles,
        ({ createdAt }) => createdAt || new Date(1970, 1, 1),
        ["desc"]
      );
      break;
    }
    case "price": {
      tmp = orderBy(_allBundles, ({ price }) => price || 0, ["desc"]);
      break;
    }
    case "lastSalePrice": {
      tmp = orderBy(_allBundles, ({ lastSalePrice }) => lastSalePrice || 0, [
        "desc",
      ]);
      break;
    }
    case "viewed": {
      tmp = orderBy(_allBundles, ({ viewed }) => viewed || 0, ["desc"]);
      break;
    }
    case "listedAt": {
      tmp = orderBy(
        _allBundles,
        ({ listedAt }) => listedAt || new Date(1970, 1, 1),
        ["desc"]
      );
      break;
    }
    case "soldAt": {
      tmp = orderBy(
        _allBundles,
        ({ soldAt }) => soldAt || new Date(1970, 1, 1),
        ["desc"]
      );
      break;
    }
    case "saleEndsAt": {
      tmp = orderBy(
        _allBundles,
        ({ saleEndsAt }) =>
          saleEndsAt
            ? saleEndsAt - new Date() >= 0
              ? saleEndsAt - new Date()
              : 1623424669
            : 1623424670,
        ["asc"]
      );
      break;
    }
  }
  return tmp;
};

router.get("/getLikesCount/:bundleID", async (req, res) => {
  try {
    let bundleID = req.params.bundleID;
    let bundle = await Bundle.findById(bundleID);
    return res.json({
      status: "success",
      data: bundle.liked,
    });
  } catch (error) {
    return res.json({
      status: "failed",
    });
  }
});

module.exports = router;
