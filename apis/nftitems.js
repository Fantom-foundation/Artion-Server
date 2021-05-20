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
const Auction = mongoose.model("Auction");

const sortBy = require("lodash.sortby");

const contractutils = require("../services/contract.utils");
const toLowerCase = require("../utils/utils");

router.post("/increaseViews", async (req, res) => {
  try {
    let contractAddress = req.body.contractAddress;
    contractAddress = toLowerCase(contractAddress);
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
    address = toLowerCase(address);
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
  } else {
    minters = minters.map((minter) => toLowerCase(minter));
  }
  let wallet = req.body.address;
  if (wallet) wallet = toLowerCase(wallet);
  console.log(`wallet is ${wallet}`);
  let category = req.body.category;
  let filters = req.body.filterby;
  let sortby = req.body.sortby;

  console.log(filters);
  let collections = [];
  if (category != undefined) {
    let categoryFilter = {
      ...(category ? { categories: category } : {}),
    };
    collections = await Collection.find(categoryFilter).select("erc721Address");
    collections = collections.map((c) => toLowerCase(c.erc721Address));
    if (collections.length == 0) {
      return res.json({
        status: "success",
        data: [],
      });
    }
    console.log("categoried collection");
    console.log(collections);
    console.log(category);
  }

  collections = [...minters, ...collections];

  let statusFilters = {
    ...(collections.length > 0 ? { minter: { $in: collections } } : {}),
  };
  let statusMinters = [];
  let statusTkIDs = [];
  try {
    if (filters.length > 0) {
      if (filters.includes("hasBids")) {
        let bids = await Bid.find(statusFilters).select(["minter", "tokenID"]);
        let bidMinters = bids.map((bid) => bid.minter);
        let bidTkIDs = bids.map((bid) => bid.tokenID);

        // let minters = statusMinters.filter((statusMinter) =>
        //   bidMinters.includes(statusMinter)
        // );
        // statusMinters = minters;
        statusMinters = [...statusMinters, ...bidMinters];
        console.log("bid minters are ");
        console.log(bidMinters);
        console.log("bid tk ids are ");
        console.log(bidTkIDs);
        console.log("status minters are ");
        console.log(statusMinters);
        // statusMinters = bidMinters.filter((bidMinter) =>
        //   statusMinters.includes(bidMinter)
        // );
        statusTkIDs = [...statusTkIDs, ...bidTkIDs];
      }
      if (filters.includes("buyNow")) {
        let lists = await Listing.find(statusFilters).select([
          "minter",
          "tokenID",
        ]);
        let listMinters = lists.map((list) => list.minter);
        let listTkIDs = lists.map((list) => list.tokenID);

        // let minters = statusMinters.filter((statusMinter) =>
        //   listMinters.includes(statusMinter)
        // );
        // statusMinters = minters;
        statusMinters = [...statusMinters, ...listMinters];
        console.log("list minters are ");
        console.log(listMinters);
        console.log("list tk ids are ");
        console.log(listTkIDs);
        console.log("status minters are ");
        console.log(statusMinters);
        // statusMinters = listMinters.filter((listMinter) =>
        //   statusMinters.includes(listMinter)
        // );
        statusTkIDs = [...statusTkIDs, ...listTkIDs];
      }
      if (filters.includes("hasOffers")) {
        let offers = await Offer.find(statusFilters).select([
          "minter",
          "tokenID",
        ]);
        let offerMinters = offers.map((offer) => offer.minter);
        let offerTkIDs = offers.map((offer) => offer.tokenID);
        // let minters = statusMinters.filter((statusMinter) =>
        //   offerMinters.includes(statusMinter)
        // );
        // statusMinters = minters;
        statusMinters = [...statusMinters, ...offerMinters];
        console.log("offer minters are ");
        console.log(offerMinters);
        console.log("offer tk ids are ");
        console.log(offerTkIDs);
        console.log("status minters are ");
        console.log(statusMinters);
        // statusMinters = offerMinters.filter((offerMinter) =>
        //   statusMinters.includes(offerMinter)
        // );
        statusTkIDs = [...statusTkIDs, ...offerTkIDs];
      }
      if (filters.includes("onAuction")) {
        let auctions = await Auction.find(statusFilters).select([
          "minter",
          "tokenID",
        ]);
        let auctionMinters = auctions.map((auction) => auction.minter);
        let auctionTkIDs = auctions.map((auction) => auction.tokenID);
        // let minters = statusMinters.filter((statusMinter) =>
        //   auctionMinters.includes(statusMinter)
        // );
        // statusMinters = minters;
        statusMinters = [...statusMinters, ...auctionMinters];
        console.log("auction minters are ");
        console.log(auctionMinters);
        console.log("auction tk ids are ");
        console.log(auctionTkIDs);
        console.log("status minters are ");
        console.log(statusMinters);
        // statusMinters = auctionMinters.filter((auctionMinter) =>
        //   statusMinters.includes(auctionMinter)
        // );
        statusTkIDs = [...statusTkIDs, ...auctionTkIDs];
      }
    }
  } catch (error) {
    // console.log(error);
  }

  let sort = {};
  switch (sortby) {
    case "price": {
      sort = { price: -1 };
      break;
    }
    case "lastSalePrice": {
      sort = { lastSalePrice: -1 };
      break;
    }
    case "viewed": {
      sort = { viewed: -1 };
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

  console.log("721 filter is ");
  // update collections here
  if (statusMinters.length != 0) {
    // if (collections.length == 0) collections = statusMinters;
    // else {
    //   let _collections = collections.filter((collection) =>
    //     statusMinters.includes(collection)
    //   );
    //   collections = _collections;
    // }
    collections = statusMinters;
  }
  if ((statusMinters.length == 0) & (filters != undefined))
    return res.json({
      status: "success",
      data: [],
    });
  console.log("collection before 721 filter is ");
  console.log(collections);
  let filter_721 = {
    ...(collections.length > 0
      ? { contractAddress: { $in: [...collections] } }
      : {}),
    ...(statusTkIDs.length > 0 ? { tokenID: { $in: [...statusTkIDs] } } : {}),
    ...(wallet ? { owner: wallet } : {}),
  };
  console.log(filter_721);
  console.log("sort");
  console.log(sort);
  let allTokens_721 = await ERC721TOKEN.find(filter_721)
    .sort(sort)
    .select([
      "contractAddress",
      "tokenID",
      "owner",
      "tokenURI",
      "price",
      "viewed",
    ]);
  let allTokens_721_Total = allTokens_721.length;

  let tokens_721 = allTokens_721.slice(step * 36, (step + 1) * 36);

  let filter_1155 = {
    ...(collections.length > 0
      ? { contractAddress: { $in: [...collections] } }
      : {}),
  };
  console.log("1155 filter is ");
  console.log(filter_1155);

  if (wallet) {
    let allTokens_1155 = await ERC1155TOKEN.find(filter_1155);
    // let myTokens = [];
    // allTokens_1155.map((tk_1155) => {
    //   let ownerMap = tk_1155.owner;
    //   if (ownerMap.has(wallet)) myTokens.push(tk_1155);
    // });
    // let token_1155 = myTokens;
    // let allTokens_1155_Total = allTokens_1155.length;

    /* */
    let _allTokens = [...allTokens_721, ...allTokens_1155];
    _allTokens = sortBy(_allTokens, sortby);
    let tokensToReturn = _allTokens.slice(step * 36, (step + 1) * 36);
    /* */

    return res.json({
      data: "success",
      data: {
        tokens: tokensToReturn,
        // tokens: tokens_721,
        total: _allTokens.length,
      },
    });
  } else {
    let allTokens_1155 = await ERC1155TOKEN.find(filter_1155).sort(sort);
    // let token_1155 = allTokens_1155.slice(step * 10, (step + 1) * 10);
    // let allTokens_1155_Total = allTokens_1155.length;

    /* */
    let _allTokens = [...allTokens_721, ...allTokens_1155];
    _allTokens = sortBy(_allTokens, sortby);
    let tokensToReturn = _allTokens.slice(step * 36, (step + 1) * 36);
    /* */
    return res.json({
      data: "success",
      data: {
        tokens: tokensToReturn,
        // tokens: tokens_721,
        total: tokensToReturn.length,
      },
    });
  }
  console.log("all 1155 tokens are ");
  console.log(allTokens1155);
});

module.exports = router;
