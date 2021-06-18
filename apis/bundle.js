const router = require("express").Router();

const ethers = require("ethers");

const mongoose = require("mongoose");
const auth = require("./middleware/auth");

const NFTITEM = mongoose.model("NFTITEM");
const Bundle = mongoose.model("Bundle");
const BundleInfo = mongoose.model("BundleInfo");
const ERC1155HOLDING = mongoose.model("ERC1155HOLDING");
const Category = mongoose.model("Category");
const Collection = mongoose.model("Collection");

const Listing = mongoose.model("Listing");
const Offer = mongoose.model("Offer");
const Bid = mongoose.model("Bid");
const Auction = mongoose.model("Auction");
const Account = mongoose.model("Account");

const orderBy = require("lodash.orderby");

const _721_ABI = require("../constants/erc721abi");

const contractutils = require("../services/contract.utils");
const toLowerCase = require("../utils/utils");

const FETCH_COUNT_PER_TIME = 18;

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
    console.log(error);
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

module.exports = router;
