const router = require("express").Router();
const mongoose = require("mongoose");
const auth = require("./middleware/auth");
const formidable = require("formidable");

const ERC721TOKEN = mongoose.model("ERC721TOKEN");
const ERC1155TOKEN = mongoose.model("ERC1155TOKEN");
const Category = mongoose.model("Category");
const Collection = mongoose.model("Collection");

const Listing = mongoose.model("Listing");
const Offer = mongoose.model("Offer");
const Bid = mongoose.model("Bid");

const contractutils = require("../services/contract.utils");

// save a new token -- returns a json of newly added token
router.post("/savenewtoken", auth, async (req, res) => {
  let form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        status: "failed",
      });
    } else {
      let contractAddress = fields.contractAddress;
      let tokenType = parseInt(fields.tokenType);
      if (tokenType == 721) {
        let newToken = new ERC721TOKEN();
        newToken.contractAddress = contractAddress;
        newToken.tokenID = fields.tokenID;
        newToken.owner = fields.account;
        newToken.tokenURI = fields.jsonHash;
        newToken.symbol = fields.symbol;
        newToken.royalty = fields.royalty;
        newToken.category = fields.category;
        newToken.imageHash = fields.imageHash;
        newToken.jsonHash = fields.jsonHash;
        let now = new Date();
        newToken.createdAt = now;

        let _newToken = await newToken.save();
        return res.send({
          status: "success",
          data: _newToken.toJSON(),
        });
      } else {
        // handle 1155 creation here
      }
    }
  });
});

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
  if (!minters) {
    minters = [];
  }
  let wallet = req.body.address;
  let category = req.body.category;
  let filters = req.body.filterby;
  let sortby = req.body.sortby;

  let collections = [];
  if (category) {
    let categoryFilter = {
      ...(category ? { categories: category } : {}),
    };
    collections = await Collection.find(categoryFilter).select("erc721Address");
    collections = collections.map((c) => c.erc721Address);
  }

  collections = [...minters, ...collections];
  if (collections == []) collections = null;

  let statusFilters = {
    ...(collections ? { minter: { $in: collections } } : {}),
  };
  let statusMinters = [];
  let statusTkIDs = [];
  try {
    if (filters.length > 0) {
      if (filters.includes("hadBid")) {
        let bids = await Bid.find(statusFilters).select(["minter", "tokenID"]);
        let bidMinters = bids.map((bid) => bid.minter);
        let bidTkIDs = bids.map((bid) => bid.tokenID);
        statusMinters = [...bidMinters];
        statusTkIDs = [...bidTkIDs];
      }
      if (filters.includes("listed")) {
        let lists = await Listing.find(statusFilters).select([
          "minter",
          "tokenID",
        ]);
        let listMinters = lists.map((list) => list.minter);
        let listTkIDs = lists.map((list) => list.tokenID);
        statusMinters = [...statusMinters, ...listMinters];
        statusTkIDs = [...statusTkIDs, ...listTkIDs];
      }
      if (filters.includes("offer")) {
        let offers = await Offer.find(statusFilters).select([
          "minter",
          "tokenID",
        ]);
        let offerMinters = offers.map((offer) => offer.minter);
        let offerTkIDs = offers.map((offer) => offer.tokenID);
        statusMinters = [...statusMinters, ...offerMinters];
        statusTkIDs = [...statusTkIDs, ...offerTkIDs];
      }
    }
  } catch (error) {}

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
