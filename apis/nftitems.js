const router = require("express").Router();
const mongoose = require("mongoose");

const ERC721TOKEN = mongoose.model("ERC721TOKEN");
const ERC1155TOKEN = mongoose.model("ERC1155TOKEN");
const Category = mongoose.model("Category");
const Collection = mongoose.model("Collection");

const Listing = mongoose.model("Listing");
const Offer = mongoose.model("Offer");
const Bid = mongoose.model("Bid");

const contractutils = require("../services/contract.utils");

router.post("/increaseViews", async (req, res) => {
  try {
    let contractAddress = req.body.contractAddress;
    let tokenID = req.body.tokenID;
    let tokenType = await Category.findOne({
      minterAddress: contractAddress,
    });
    tokenType = tokenType.type;
    if (tokenType == 721) {
      let token = await ERC721TOKEN.findOne({
        contractAddress: contractAddress,
        tokenID: tokenID,
      });
      token.viewed = token.viewed + 1;
      let _token = await token.save();
      return res.json({
        status: "success",
        data: _token.viewed,
      });
    } else if (tokenType == 1155) {
      let token = await ERC1155TOKEN.findOne({
        contractAddress: contractAddress,
        tokenID: tokenID,
      });
      token.viewed = token.viewed + 1;
      let _token = await token.save();
      return res.json({
        status: "success",
        data: _token.viewed,
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

router.post("/getTokenURI", async (req, res) => {
  try {
    let address = req.body.contractAddress;
    let tokenID = req.body.tokenID;
    let uri = await contractutils.getTokenInfo(address, tokenID);
    return res.json({
      status: "success",
      data: uri,
    });
  } catch (error) {
    return res.status(400).json({
      status: "failed",
      data: "token id out of total balance",
    });
  }
});

router.post("/fetchTokens", async (req, res) => {
  let step = parseInt(req.body.step);
  let minters = req.body.collectionAddresses;
  if (!minters) minters = [];
  let wallet = req.body.address;
  let category = req.body.category;
  let filters = req.body.filterby;
  let sortby = req.body.sortby;

  let categoryFilter = {
    ...(category ? { categories: category } : {}),
  };

  let collections = await Collection.find(categoryFilter).select(
    "erc721Address"
  );
  collections = collections.map((c) => c.erc721Address);
  collections = [...minters, ...collections];
  if (collections == []) collections = null;

  let statusFilters = null;
  if (filters.length > 0) {
    if (filters.includes("hadBid")) {
      let bids = await Bid.find({ minter: { $in: collections } }).select([
        "minter",
        "tokenID",
      ]);
    }
    if (filters.includes("listed")) {
      let lists = await Listing.find({ minter: { $in: collections } }).select([
        "minter",
        "tokenID",
      ]);
    }
    if (filters.includes("offer")) {
      let offers = await Offer.find({ nft: { $minter: collections } }).select([
        "nft",
        "tokenID",
      ]);
    }
  }

  let sort = {};
  switch (sortby) {
    case "price": {
      sort = { price: 1 };
      break;
    }
    case "lastSalePrice": {
      sort = { lastSalePrice: 1 };
      break;
    }
    case "viewed": {
      sort = { viewed: 1 };
      break;
    }
    case "listedAt": {
      sort = { listedAt: 1 };
      break;
    }
    case "soldAt": {
      sort = { soldAt: 1 };
      break;
    }
    case "saleEndsAt": {
      sort = { saleEndsAt: 1 };
    }
  }

  let filter_721 = {
    ...(collections.length > 0
      ? { contractAddress: { $in: collections } }
      : {}),
    ...(wallet ? { owner: wallet } : {}),
  };
  let allTokens_721 = await ERC721TOKEN.find(filter_721).sort(sort);
  let allTokens_721_Total = allTokens_721.length;

  let tokens_721 = allTokens_721.slice(step * 20, (step + 1) * 20);

  let filter_1155 = {
    ...(minters ? { contractAddress: { $in: minters } } : {}),
    ...(wallet ? { owner: wallet } : {}),
  };
  return res.json({
    data: "success",
    data: {
      tokens: tokens_721,
      total: allTokens_721_Total,
    },
  });
});

module.exports = router;
