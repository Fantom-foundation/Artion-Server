const router = require("express").Router();

const ethers = require("ethers");

const mongoose = require("mongoose");
const auth = require("./middleware/auth");

const ERC721TOKEN = mongoose.model("ERC721TOKEN");
const ERC1155TOKEN = mongoose.model("ERC1155TOKEN");
const ERC1155HOLDING = mongoose.model("ERC1155HOLDING");
const Category = mongoose.model("Category");
const Collection = mongoose.model("Collection");

const Listing = mongoose.model("Listing");
const Offer = mongoose.model("Offer");
const Bid = mongoose.model("Bid");
const Auction = mongoose.model("Auction");

const sortBy = require("lodash.sortby");
const orderBy = require("lodash.orderby");

const _721_ABI = require("../constants/erc721abi");

const contractutils = require("../services/contract.utils");
const toLowerCase = require("../utils/utils");

const FETCH_COUNT_PER_TIME = 18;

const provider = new ethers.providers.JsonRpcProvider(
  _721_ABI.RPC,
  _721_ABI.CHAINID
);

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
    let type = await Category.findOne({ minterAddress: address });
    type = parseInt(type.type);
    let uri = "";
    if (type == 721) {
      let tk = await ERC721TOKEN.findOne({
        contractAddress: address,
        tokenID: tokenID,
      });
      uri = tk.tokenURI;
      return res.json({
        status: "success",
        data: uri,
      });
    } else {
      let tk = await ERC1155TOKEN.findOne({
        contractAddress: address,
        tokenID: tokenID,
      });
      uri = tk.tokenURI;
      return res.json({
        status: "success",
        data: uri,
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: "failed",
      data: "token id out of total balance",
    });
  }
});

const sortNfts = (_allTokens, sortby) => {
  let tmp = [];
  switch (sortby) {
    case "createdAt": {
      tmp = orderBy(
        _allTokens,
        ({ createdAt }) => createdAt || new Date(1970, 1, 1),
        ["desc"]
      );
      break;
    }
    case "price": {
      tmp = orderBy(_allTokens, ({ price }) => price || 0, ["desc"]);
      break;
    }
    case "lastSalePrice": {
      tmp = orderBy(_allTokens, ({ lastSalePrice }) => lastSalePrice || 0, [
        "desc",
      ]);
      break;
    }
    case "viewed": {
      tmp = orderBy(_allTokens, ({ viewed }) => viewed || 0, ["desc"]);
      break;
    }
    case "listedAt": {
      tmp = orderBy(
        _allTokens,
        ({ listedAt }) => listedAt || new Date(1970, 1, 1),
        ["desc"]
      );
      break;
    }
    case "soldAt": {
      tmp = orderBy(
        _allTokens,
        ({ soldAt }) => soldAt || new Date(1970, 1, 1),
        ["desc"]
      );
      break;
    }
    case "saleEndsAt": {
      tmp = orderBy(
        _allTokens,
        ({ saleEndsAt }) => saleEndsAt || new Date(1970, 1, 1),
        ["desc"]
      );
      break;
    }
  }
  return tmp;
};

router.post("/fetchTokens", async (req, res) => {
  // all smart contract categories - 721/1155
  let tokenTypes = await Category.find();
  tokenTypes = tokenTypes.map((tt) => [tt.minterAddress, tt.type]);
  try {
    let collections2filter = null;
    // get options from request & process
    let step = parseInt(req.body.step); // step where to fetch
    let selectedCollections = req.body.collectionAddresses; //collection addresses from request
    let filters = req.body.filterby; //status -> array or null
    let sortby = req.body.sortby; //sort -> string param
    let wallet = req.body.address; // account address from meta mask
    if (wallet) wallet = toLowerCase(wallet);

    if (!selectedCollections) selectedCollections = [];
    else {
      selectedCollections = selectedCollections.map((selectedCollection) =>
        toLowerCase(selectedCollection)
      );
      collections2filter = selectedCollections;
    }
    let category = req.body.category; //category -> array or null

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
        if (collections2filter.length == 0) collections2filter = null;
      } else {
        collections2filter = categoryCollections;
      }
    }
    /*
    for global search
     */
    if (!wallet) {
      if (filters == undefined) {
        /*
        when no status option 
         */
        /* contract address filter */
        let collectionFilters = {
          ...(collections2filter != null
            ? { contractAddress: { $in: [...collections2filter] } }
            : {}),
        };
        let tokens_721 = await ERC721TOKEN.find(collectionFilters);
        let tokens_1155 = await ERC1155TOKEN.find(collectionFilters);
        let allTokens = [...tokens_721, ...tokens_1155];
        let sortedTokens = sortNfts(allTokens, sortby);
        let searchResults = sortedTokens.slice(
          step * FETCH_COUNT_PER_TIME,
          (step + 1) * FETCH_COUNT_PER_TIME
        );
        return res.json({
          status: "success",
          data: {
            tokens: searchResults,
            total: allTokens.length,
          },
        });
      } else {
        /*
        when status option
         */
        /* minter filter */
        let minterFilters = {
          ...(collections2filter != null
            ? { miner: { $in: [...collections2filter] } }
            : {}),
        };
        let statusFilteredTokens = [];
        if (filters.includes("hasBids")) {
          /* for buy now - pick from Bid */
          let tokens = await Bid.find(minterFilters).select([
            "minter",
            "tokenID",
          ]);
          if (tokens) {
            tokens.map((pair) => {
              let minter_id_pair = [pair.minter, pair.tokenID];
              if (!statusFilteredTokens.includes())
                statusFilteredTokens.push(minter_id_pair);
            });
          }
        }
        if (filters.includes("buyNow")) {
          /* for had bids - pick from Listing */
          let tokens = await Listing.find(minterFilters).select([
            "minter",
            "tokenID",
          ]);
          if (tokens) {
            tokens.map((pair) => {
              let minter_id_pair = [pair.minter, pair.tokenID];
              if (!statusFilteredTokens.includes())
                statusFilteredTokens.push(minter_id_pair);
            });
          }
        }
        if (filters.includes("hasOffers")) {
          /* for has offers - pick from Offer */
          let tokens = await Offer.find(minterFilters).select([
            "minter",
            "tokenID",
          ]);
          if (tokens) {
            tokens.map((pair) => {
              let minter_id_pair = [pair.minter, pair.tokenID];
              if (!statusFilteredTokens.includes())
                statusFilteredTokens.push(minter_id_pair);
            });
          }
        }
        if (filters.includes("onAuction")) {
          /* for on auction - pick from Auction */
          let tokens = await Auction.find(minterFilters).select([
            "minter",
            "tokenID",
          ]);
          if (tokens) {
            tokens.map((pair) => {
              let minter_id_pair = [pair.minter, pair.tokenID];
              if (!statusFilteredTokens.includes())
                statusFilteredTokens.push(minter_id_pair);
            });
          }
        }

        let allFilteredTokens = [];
        let statusPromise = statusFilteredTokens.map(async (tk) => {
          let tokenCategory = tokenTypes.filter(
            (tokenType) => tokenType[0] == tk[0]
          );
          tokenCategory = tokenCategory[0];
          if (parseInt(tokenCategory[1]) == 721) {
            let token = await ERC721TOKEN.findOne({
              contractAddress: tk[0],
              tokenID: tk[1],
            });
            if (token) allFilteredTokens.push(token);
          } else if (parseInt(tokenCategory[1]) == 1155) {
            let token = await ERC1155TOKEN.findOne({
              contractAddress: tk[0],
              tokenID: tk[1],
            });
            if (token) allFilteredTokens.push(token);
          }
        });
        await Promise.all(statusPromise);
        let sortedTokens = sortNfts(allFilteredTokens, sortby);
        let searchResults = sortedTokens.slice(
          step * FETCH_COUNT_PER_TIME,
          (step + 1) * FETCH_COUNT_PER_TIME
        );
        return res.json({
          status: "success",
          data: {
            tokens: searchResults,
            total: allFilteredTokens.length,
          },
        });
      }
    } else {
      /*
    for account search
     */
      let holdings = await ERC1155HOLDING.find({
        holderAddress: wallet,
      });
      let holders = holdings.map((holder) => {
        return [holder.contractAddress, holder.tokenID];
      });
      if (filters == undefined) {
        /*
        when no status option 
         */
        /* contract address filter */
        let collectionFilters721 = {
          ...(collections2filter != null
            ? { contractAddress: { $in: [...collections2filter] } }
            : {}),
          ...(wallet ? { owner: wallet } : {}),
        };
        let collectionFilters1155 = {
          ...(collections2filter != null
            ? { contractAddress: { $in: [...collections2filter] } }
            : {}),
        };
        let tokens_721 = await ERC721TOKEN.find(collectionFilters721);
        let _tokens_1155 = await ERC1155TOKEN.find(collectionFilters1155);
        let tokens_1155 = _tokens_1155.filter((token_1155) => {
          holders.includes([token_1155.contractAddress, token_1155.tokenID]);
        });
        let allTokens = [...tokens_721, ...tokens_1155];
        let sortedTokens = sortNfts(allTokens, sortby);
        let searchResults = sortedTokens.slice(
          step * FETCH_COUNT_PER_TIME,
          (step + 1) * FETCH_COUNT_PER_TIME
        );
        return res.json({
          status: "success",
          data: {
            tokens: searchResults,
            total: allTokens.length,
          },
        });
      } else {
        /*
        when status option
         */
        /* minter filter */
        let minterFilters = {
          ...(collections2filter != null
            ? { miner: { $in: [...collections2filter] } }
            : {}),
        };
        let statusFilteredTokens = [];
        if (filters.includes("hasBids")) {
          /* for buy now - pick from Bid */
          let tokens = await Bid.find(minterFilters).select([
            "minter",
            "tokenID",
          ]);
          if (tokens) {
            tokens.map((pair) => {
              let minter_id_pair = [pair.minter, pair.tokenID];
              if (!statusFilteredTokens.includes())
                statusFilteredTokens.push(minter_id_pair);
            });
          }
        }
        if (filters.includes("buyNow")) {
          /* for had bids - pick from Listing */
          let tokens = await Listing.find(minterFilters).select([
            "minter",
            "tokenID",
          ]);
          if (tokens) {
            tokens.map((pair) => {
              let minter_id_pair = [pair.minter, pair.tokenID];
              if (!statusFilteredTokens.includes())
                statusFilteredTokens.push(minter_id_pair);
            });
          }
        }
        if (filters.includes("hasOffers")) {
          /* for has offers - pick from Offer */
          let tokens = await Offer.find(minterFilters).select([
            "minter",
            "tokenID",
          ]);
          if (tokens) {
            tokens.map((pair) => {
              let minter_id_pair = [pair.minter, pair.tokenID];
              if (!statusFilteredTokens.includes())
                statusFilteredTokens.push(minter_id_pair);
            });
          }
        }
        if (filters.includes("onAuction")) {
          /* for on auction - pick from Auction */
          let tokens = await Auction.find(minterFilters).select([
            "minter",
            "tokenID",
          ]);
          if (tokens) {
            tokens.map((pair) => {
              let minter_id_pair = [pair.minter, pair.tokenID];
              if (!statusFilteredTokens.includes())
                statusFilteredTokens.push(minter_id_pair);
            });
          }
        }

        let allFilteredTokens721 = [];
        let allFilteredTokens1155 = [];
        let allFilteredTokens = [];
        let statusPromise = statusFilteredTokens.map(async (tk) => {
          let tokenCategory = tokenTypes.filter(
            (tokenType) => tokenType[0] == tk[0]
          );
          tokenCategory = tokenCategory[0];
          if (parseInt(tokenCategory[1]) == 721) {
            let token = await ERC721TOKEN.findOne({
              contractAddress: tk[0],
              tokenID: tk[1],
            });
            if (token) allFilteredTokens721.push(token);
          } else if (parseInt(tokenCategory[1]) == 1155) {
            let token = await ERC1155TOKEN.findOne({
              contractAddress: tk[0],
              tokenID: tk[1],
            });
            if (token) {
              if (holders.includes([token.contractAddress, token.tokenID]))
                allFilteredTokens1155.push(token);
            }
          }
        });
        await Promise.all(statusPromise);
        allFilteredTokens = [...allFilteredTokens721, ...allFilteredTokens1155];
        let sortedTokens = sortNfts(allFilteredTokens, sortby);
        let searchResults = sortedTokens.slice(
          step * FETCH_COUNT_PER_TIME,
          (step + 1) * FETCH_COUNT_PER_TIME
        );
        return res.json({
          status: "success",
          data: {
            tokens: searchResults,
            total: allFilteredTokens.length,
          },
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      status: "failed",
    });
  }
});

router.post("/fetchTokens1", async (req, res) => {
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

        statusMinters = [...statusMinters, ...bidMinters];

        statusTkIDs = [...statusTkIDs, ...bidTkIDs];
      }
      if (filters.includes("buyNow")) {
        let lists = await Listing.find(statusFilters).select([
          "minter",
          "tokenID",
        ]);
        let listMinters = lists.map((list) => list.minter);
        let listTkIDs = lists.map((list) => list.tokenID);

        statusMinters = [...statusMinters, ...listMinters];

        statusTkIDs = [...statusTkIDs, ...listTkIDs];
      }
      if (filters.includes("hasOffers")) {
        let offers = await Offer.find(statusFilters).select([
          "minter",
          "tokenID",
        ]);
        let offerMinters = offers.map((offer) => offer.minter);
        let offerTkIDs = offers.map((offer) => offer.tokenID);

        statusMinters = [...statusMinters, ...offerMinters];

        statusTkIDs = [...statusTkIDs, ...offerTkIDs];
      }
      if (filters.includes("onAuction")) {
        let auctions = await Auction.find(statusFilters).select([
          "minter",
          "tokenID",
        ]);
        let auctionMinters = auctions.map((auction) => auction.minter);
        let auctionTkIDs = auctions.map((auction) => auction.tokenID);

        statusMinters = [...statusMinters, ...auctionMinters];
        statusTkIDs = [...statusTkIDs, ...auctionTkIDs];
      }
    }
  } catch (error) {
  } finally {
    if (filters != undefined)
      if (filters.length > 0 && statusTkIDs.length == 0) {
        statusTkIDs = [-1];
      }
  }

  // update collections here
  if (statusMinters.length != 0) {
    collections = statusMinters;
  }
  if ((statusMinters.length == 0) & (filters != undefined))
    return res.json({
      status: "success",
      data: [],
    });
  let filter_721 = {
    ...(collections.length > 0
      ? { contractAddress: { $in: [...collections] } }
      : {}),
    ...(statusTkIDs.length > 0 ? { tokenID: { $in: [...statusTkIDs] } } : {}),
    ...(wallet ? { owner: wallet } : {}),
  };
  let allTokens_721 = await ERC721TOKEN.find(filter_721);

  // let filter_1155 = {
  //   ...(collections.length > 0
  //     ? { contractAddress: { $in: [...collections] } }
  //     : {}),
  // };

  let filter_1155 = {
    ...(collections.length > 0
      ? { contractAddress: { $in: [...collections] } }
      : {}),
    ...(statusTkIDs.length > 0 ? { tokenID: { $in: [...statusTkIDs] } } : {}),
  };

  if (wallet) {
    let holdings = await ERC1155HOLDING.find({ holderAddress: wallet });

    let myTokens = [];
    let allTokens_1155 = await ERC1155TOKEN.find(filter_1155);
    holdings.map((holding) => {
      let _tk = allTokens_1155.filter(
        (_1155Token) =>
          _1155Token.contractAddress == holding.contractAddress &&
          _1155Token.tokenID == holding.tokenID
      );
      if (_tk.length > 0) myTokens.push(_tk[0]);
    });
    let _allTokens = [...allTokens_721, ...myTokens];
    let tmp = [];
    switch (sortby) {
      case "createdAt": {
        tmp = orderBy(
          _allTokens,
          ({ createdAt }) => createdAt || new Date(1970, 1, 1),
          ["desc"]
        );
        break;
      }
      case "price": {
        tmp = orderBy(_allTokens, ({ price }) => price || 0, ["desc"]);
        break;
      }
      case "lastSalePrice": {
        tmp = orderBy(_allTokens, ({ lastSalePrice }) => lastSalePrice || 0, [
          "desc",
        ]);
        break;
      }
      case "viewed": {
        tmp = orderBy(_allTokens, ({ viewed }) => viewed || 0, ["desc"]);
        break;
      }
      case "listedAt": {
        tmp = orderBy(
          _allTokens,
          ({ listedAt }) => listedAt || new Date(1970, 1, 1),
          ["desc"]
        );
        break;
      }
      case "soldAt": {
        tmp = orderBy(
          _allTokens,
          ({ soldAt }) => soldAt || new Date(1970, 1, 1),
          ["desc"]
        );
        break;
      }
      case "saleEndsAt": {
        tmp = orderBy(
          _allTokens,
          ({ saleEndsAt }) => saleEndsAt || new Date(1970, 1, 1),
          ["desc"]
        );
        break;
      }
    }
    let __allTokens = tmp;
    let tokensToReturn = __allTokens.slice(
      step * FETCH_COUNT_PER_TIME,
      (step + 1) * FETCH_COUNT_PER_TIME
    );
    /* */

    return res.json({
      data: "success",
      data: {
        tokens: tokensToReturn,
        total: __allTokens.length,
      },
    });
  } else {
    let allTokens_1155 = await ERC1155TOKEN.find(filter_1155);

    /* */
    let _allTokens = [...allTokens_721, ...allTokens_1155];
    let tmp = [];
    switch (sortby) {
      case "createdAt": {
        tmp = orderBy(
          _allTokens,
          ({ createdAt }) => createdAt || new Date(1970, 1, 1),
          ["desc"]
        );
        break;
      }
      case "price": {
        tmp = orderBy(_allTokens, ({ price }) => price || 0, ["desc"]);
        break;
      }
      case "lastSalePrice": {
        tmp = orderBy(_allTokens, ({ lastSalePrice }) => lastSalePrice || 0, [
          "desc",
        ]);
        break;
      }
      case "viewed": {
        tmp = orderBy(_allTokens, ({ viewed }) => viewed || 0, ["desc"]);
        break;
      }
      case "listedAt": {
        tmp = orderBy(
          _allTokens,
          ({ listedAt }) => listedAt || new Date(1970, 1, 1),
          ["desc"]
        );
        break;
      }
      case "soldAt": {
        tmp = orderBy(
          _allTokens,
          ({ soldAt }) => soldAt || new Date(1970, 1, 1),
          ["desc"]
        );
        break;
      }
      case "saleEndsAt": {
        tmp = orderBy(
          _allTokens,
          ({ saleEndsAt }) => saleEndsAt || new Date(1970, 1, 1),
          ["desc"]
        );
        break;
      }
    }
    let __allTokens = tmp;
    let tokensToReturn = __allTokens.slice(
      step * FETCH_COUNT_PER_TIME,
      (step + 1) * FETCH_COUNT_PER_TIME
    );
    /* */
    return res.json({
      data: "success",
      data: {
        tokens: tokensToReturn,
        // tokens: tokens_721,
        total: __allTokens.length,
      },
    });
  }
});

const extractAddress = (data) => {
  let length = data.length;
  return data.substring(0, 2) + data.substring(length - 40);
};

router.post("/transfer721History", async (req, res) => {
  try {
    let tokenID = parseInt(req.body.tokenID);
    let address = toLowerCase(req.body.address);
    let history = await fetchTransferHistory721(address, tokenID);
    return res.json({
      status: "success",
      data: history,
    });
  } catch (error) {
    return res.json({
      status: "failed",
    });
  }
});

router.post("/transfer1155History", async (req, res) => {
  try {
    let tokenID = parseInt(req.body.tokenID);
    let address = toLowerCase(req.body.address);
    let history = await fetchTransferHistory1155(address, tokenID);
    return res.json({
      status: "success",
      data: history,
    });
  } catch (error) {
    return res.json({
      status: "failed",
    });
  }
});

const getBlockTime = async (blockNumber) => {
  let block = await provider.getBlock(blockNumber);
  let blockTime = block.timestamp;
  blockTime = new Date(blockTime * 1000);
  return blockTime;
};

const parseBatchTransferData = (data) => {
  let tokenIDs = [];
  data = data.substring(2);
  let segments = data.length / 64;
  let tkCount = segments / 2;
  let tkData = data.substring(64 * 3, 64 * (tkCount + 1));
  for (let i = 0; i < tkData.length / 64; ++i) {
    let _tkData = tkData.substring(i * 64, (i + 1) * 64);
    let tokenID = parseInt(_tkData.toString(), 16);
    tokenIDs.push(tokenID);
  }
  return tokenIDs;
};

const fetchTransferHistory721 = async (address, tokenID) => {
  let evts = await provider.getLogs({
    address: address,
    fromBlock: 0,
    topics: [
      ethers.utils.id("Transfer(address,address,uint256)"),
      null,
      null,
      ethers.utils.hexZeroPad(tokenID, 32),
    ],
  });

  let history = [];
  let promise = evts.map(async (evt) => {
    let from = extractAddress(evt.topics[1]);
    let to = extractAddress(evt.topics[2]);
    let blockNumber = evt.blockNumber;
    let blockTime = await getBlockTime(blockNumber);
    history.push({
      from,
      to,
      blockTime,
    });
  });
  await Promise.all(promise);
  return history;
};
const parseSingleTrasferData = (data) => {
  return [
    parseInt(data.substring(0, 66), 16),
    parseInt(data.substring(66), 16),
  ];
};

const fetchTransferHistory1155 = async (address, id) => {
  let singleTransferEvts = await provider.getLogs({
    address: address,
    fromBlock: 0,
    topics: [
      ethers.utils.id(
        "TransferSingle(address,address,address,uint256,uint256)"
      ),
      null,
      null,
      null,
      null,
      null,
    ],
  });
  // console.log(singleTransferEvts);
  let batchTransferEvts = await provider.getLogs({
    address: address,
    fromBlock: 0,
    topics: [
      ethers.utils.id(
        "TransferBatch(address,address,address,uint256[],uint256[])"
      ),
      null,
      null,
      null,
      null,
      null,
    ],
  });

  let history = [];

  // process single transfer event logs
  let singplePromise = singleTransferEvts.map(async (evt) => {
    let data = evt.data;
    data = parseSingleTrasferData(data);
    let tokenID = data[0];
    if (parseInt(tokenID) == parseInt(id)) {
      let topics = evt.topics;
      let blockNumber = evt.blockNumber;
      let blockTime = await getBlockTime(blockNumber);
      let tokenTransferValue = data[1];
      let from = toLowerCase(extractAddress(topics[2]));
      let to = toLowerCase(extractAddress(topics[3]));
      history.push({
        from,
        to,
        blockTime,
        tokenID,
        // value: tokenTransferValue,
      });
    }
  });
  await Promise.all(singplePromise);

  let batchPromise = batchTransferEvts.map(async (evt) => {
    let data = evt.data;
    let topics = evt.topics;
    let tokenIDs = parseBatchTransferData(data);
    if (tokenIDs.includes(id)) {
      let from = toLowerCase(extractAddress(topics[2]));
      let to = toLowerCase(extractAddress(topics[3]));
      let blockNumber = evt.blockNumber;
      let blockTime = null;
      let _batchPromise = tokenIDs.map(async (tokenID) => {
        if (parseInt(tokenID) == parseInt(id)) {
          if (blockTime == null) blockTime = await getBlockTime(blockNumber);
          history.push({
            from,
            to,
            blockTime,
            tokenID,
          });
        }
      });
      await Promise.all(_batchPromise);
    }
  });
  await Promise.all(batchPromise);
  // process batch transfer event logs
  let _history = orderBy(history, "blockTime", "asc");
  return _history;
};

module.exports = router;
