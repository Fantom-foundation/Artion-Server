require('dotenv').config();
const router = require('express').Router();
const ethers = require('ethers');

const mongoose = require('mongoose');
const NFTITEM = mongoose.model('NFTITEM');
const ERC1155HOLDING = mongoose.model('ERC1155HOLDING');
const Category = mongoose.model('Category');
const Collection = mongoose.model('Collection');
const Listing = mongoose.model('Listing');
const Offer = mongoose.model('Offer');
const Bid = mongoose.model('Bid');
const Auction = mongoose.model('Auction');
const Account = mongoose.model('Account');
const BundleInfo = mongoose.model('BundleInfo');
const Bundle = mongoose.model('Bundle');
const BundleListing = mongoose.model('BundleListing');
const BundleOffer = mongoose.model('BundleOffer');
const TradeHistory = mongoose.model('TradeHistory');
const UnlockableContents = mongoose.model('UnlockableContents');

const orderBy = require('lodash.orderby');
const toLowerCase = require('../utils/utils');

const { getPrice } = require('../services/price.feed');
const sortBy = require('lodash.sortby');

const provider = new ethers.providers.JsonRpcProvider(
  process.env.NETWORK_RPC,
  parseInt(process.env.NETWORK_CHAINID)
);

const nonImage = 'non-image';

const formatPrice = (price = 0, payToken) => {
  if (
    payToken === process.env.PRICE_USDC ||
    payToken === process.env.PRICE_FUSDT
  ) {
    return price / 1e12;
  }

  return price;
};

const updatePrices = (items) => {
  items.map((item) => {
    item.currentPriceInUSD = item.price * getPrice(item.paymentToken);
  });

  return items;
};

router.post('/increaseViews', async (req, res) => {
  try {
    let contractAddress = req.body.contractAddress;
    contractAddress = toLowerCase(contractAddress);
    let tokenID = parseInt(req.body.tokenID);
    let token = await NFTITEM.findOne({
      contractAddress: contractAddress,
      tokenID: tokenID
    });
    token.viewed = token.viewed + 1;
    let _token = await token.save();
    return res.json({
      status: 'success',
      data: _token.viewed
    });
  } catch (error) {
    return res.status(400).json({
      status: 'failed'
    });
  }
});

const sortItems = (_allTokens, sortby) => {
  let tmp = [];
  switch (sortby) {
    case 'createdAt': {
      tmp = orderBy(
        _allTokens,
        ({ createdAt }) => createdAt || new Date(1970, 1, 1),
        ['desc']
      );
      break;
    }
    case 'oldest': {
      tmp = orderBy(
        _allTokens,
        ({ createdAt }) => createdAt || new Date(1970, 1, 1),
        ['asc']
      );
      break;
    }
    case 'price': {
      tmp = orderBy(
        _allTokens,
        ({ currentPriceInUSD }) => currentPriceInUSD || 0,
        ['desc']
      );
      break;
    }
    case 'cheapest': {
      tmp = orderBy(
        _allTokens,
        ({ currentPriceInUSD }) => currentPriceInUSD || 0,
        ['asc']
      );
      break;
    }
    case 'lastSalePrice': {
      tmp = orderBy(
        _allTokens,
        ({ lastSalePriceInUSD }) => lastSalePriceInUSD || 0,
        ['desc']
      );
      break;
    }
    case 'viewed': {
      tmp = orderBy(_allTokens, ({ viewed }) => viewed || 0, ['desc']);
      break;
    }
    case 'listedAt': {
      tmp = orderBy(
        _allTokens,
        ({ listedAt }) => listedAt || new Date(1970, 1, 1),
        ['desc']
      );
      break;
    }
    case 'soldAt': {
      tmp = orderBy(
        _allTokens,
        ({ soldAt }) => soldAt || new Date(1970, 1, 1),
        ['desc']
      );
      break;
    }
    case 'saleEndsAt': {
      tmp = orderBy(
        _allTokens,
        ({ saleEndsAt }) =>
          saleEndsAt
            ? saleEndsAt - new Date() >= 0
              ? saleEndsAt - new Date()
              : 1623424669
            : 1623424670,
        ['asc']
      );
      break;
    }
  }
  return tmp;
};

const isIncludedInArray = (array, target) => {
  let hash = {};
  for (let i = 0; i < array.length; ++i) {
    hash[array[i]] = i;
  }
  return hash.hasOwnProperty(target);
};

const selectTokens = async (req, res) => {
  // all smart contract categories - 721/1155
  let tokenTypes = await Category.find();
  tokenTypes = tokenTypes.map((tt) => [tt.minterAddress, tt.type]);
  try {
    let collections2filter = null;
    // get options from request & process
    let selectedCollections = req.body.collectionAddresses; //collection addresses from request
    let filters = req.body.filterby; //status -> array or null
    console.log('filters', filters);
    let sortby = req.body.sortby; //sort -> string param
    // create a sort by option
    let selectOption;
    let _sortBy = sortby;
    if (sortby == 'oldest') sortby = 'createdAt';
    if (sortby == 'lastSalePrice')
      selectOption = [
        'contractAddress',
        'tokenID',
        'tokenURI',
        'tokenType',
        'thumbnailPath',
        'name',
        'imageURL',
        'supply',
        'price',
        'paymentToken',
        'priceInUSD',
        'liked',
        'isAppropriate',
        'saleEndsAt',
        'createdAt',
        _sortBy,
        'lastSalePricePaymentToken',
        'lastSalePriceInUSD'
      ];
    else if (sortby == 'saleEndsAt')
      selectOption = [
        'contractAddress',
        'tokenID',
        'tokenURI',
        'tokenType',
        'thumbnailPath',
        'name',
        'imageURL',
        'supply',
        'price',
        'paymentToken',
        'priceInUSD',
        'liked',
        'isAppropriate',
        'lastSalePrice',
        'lastSalePricePaymentToken',
        'lastSalePriceInUSD',
        'createdAt',
        _sortBy
      ];
    else if (sortby == 'createdAt')
      selectOption = [
        'contractAddress',
        'tokenID',
        'tokenURI',
        'tokenType',
        'thumbnailPath',
        'name',
        'imageURL',
        'supply',
        'price',
        'paymentToken',
        'priceInUSD',
        'liked',
        'isAppropriate',
        'lastSalePrice',
        'lastSalePricePaymentToken',
        'lastSalePriceInUSD',
        'saleEndsAt',
        'createdAt'
      ];
    else
      selectOption = [
        'contractAddress',
        'tokenID',
        'tokenURI',
        'tokenType',
        'thumbnailPath',
        'name',
        'imageURL',
        'supply',
        'price',
        'paymentToken',
        'priceInUSD',
        'liked',
        'isAppropriate',
        'lastSalePrice',
        'lastSalePricePaymentToken',
        'lastSalePriceInUSD',
        'saleEndsAt',
        'createdAt',
        sortby
      ];
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
        categories: category
      }).select('erc721Address');
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
          return [];
        }
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
          thumbnailPath: { $ne: nonImage },
          isAppropriate: true
        };
        let allTokens = await NFTITEM.find(collectionFilters)
          .select(selectOption)
          .lean();
        return allTokens;
      } else {
        /*
        when status option
         */
        /* minter filter */
        let minterFilters = {
          ...(collections2filter != null
            ? { minter: { $in: [...collections2filter] } }
            : {})
        };
        let statusFilteredTokens = [];
        if (filters.includes('hasBids')) {
          /* for buy now - pick from Bid */
          let tokens = await Bid.find(minterFilters).select([
            'minter',
            'tokenID'
          ]);
          if (tokens) {
            tokens.map((pair) => {
              let minter_id_pair = [pair.minter, pair.tokenID];
              statusFilteredTokens.push(minter_id_pair);
            });
          }
        }
        if (filters.includes('buyNow')) {
          /* for had bids - pick from Listing */
          let tokens = await Listing.find(minterFilters).select([
            'minter',
            'tokenID'
          ]);
          if (tokens) {
            tokens.map((pair) => {
              let minter_id_pair = [pair.minter, pair.tokenID];
              statusFilteredTokens.push(minter_id_pair);
            });
          }
        }
        if (filters.includes('hasOffers')) {
          /* for has offers - pick from Offer */
          let minterFilters4Offer = {
            ...(collections2filter != null
              ? { minter: { $in: [...collections2filter] } }
              : {})
            // ...{ deadline: { $gt: new Date() } },
          };
          let tokens = await Offer.find(minterFilters4Offer).select([
            'minter',
            'tokenID'
          ]);
          if (tokens) {
            tokens.map((pair) => {
              let minter_id_pair = [pair.minter, pair.tokenID];
              statusFilteredTokens.push(minter_id_pair);
            });
          }
        }
        if (filters.includes('onAuction')) {
          /* for on auction - pick from Auction */
          console.log('filter encountered here');
          let minterFilters4Auction = {
            ...(collections2filter != null
              ? { minter: { $in: [...collections2filter] } }
              : {})
            // ...{ endTime: { $gt: new Date() } },
          };
          console.log('minter filters for auction');
          let tokens = await Auction.find(minterFilters4Auction).select([
            'minter',
            'tokenID'
          ]);
          console.log('tokens in auction');
          if (tokens) {
            tokens.map((pair) => {
              let minter_id_pair = [pair.minter, pair.tokenID];
              statusFilteredTokens.push(minter_id_pair);
            });
          }
        }
        statusFilteredTokens = statusFilteredTokens.filter(
          ((t = {}), (a) => !(t[a] = a in t))
        );

        let allFilteredTokens = [];
        let statusPromise = statusFilteredTokens.map(async (tk) => {
          let token = await NFTITEM.findOne({
            contractAddress: tk[0],
            tokenID: tk[1]
          }).select(selectOption);
          if (token) {
            allFilteredTokens.push(token);
          }
        });
        await Promise.all(statusPromise);
        return allFilteredTokens;
      }
    } else {
      /*
    for account search
     */

      let holdingSupplies = new Map();
      let holdings = await ERC1155HOLDING.find({
        holderAddress: wallet,
        supplyPerHolder: { $gt: 0 }
      });
      let holders = holdings.map((holder) => {
        holdingSupplies.set(
          holder.contractAddress + holder.tokenID,
          holder.supplyPerHolder
        );
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
          ...(wallet != null ? { owner: wallet } : {}),
          thumbnailPath: { $ne: nonImage },
          isAppropriate: true
        };
        let collectionFilters1155 = {
          ...(collections2filter != null
            ? { contractAddress: { $in: [...collections2filter] } }
            : {}),
          thumbnailPath: { $ne: nonImage },
          isAppropriate: true
        };
        let tokens_721 = await NFTITEM.find(collectionFilters721)
          .select(selectOption)
          .lean();
        let _tokens_1155 = await NFTITEM.find(collectionFilters1155)
          .select(selectOption)
          .lean();
        let tokens_1155 = [];
        _tokens_1155.map((token_1155) => {
          let isIncluded = isIncludedInArray(holders, [
            token_1155.contractAddress,
            token_1155.tokenID
          ]);
          if (isIncluded)
            tokens_1155.push({
              supply: token_1155.supply,
              price: token_1155.price,
              paymentToken: token_1155.paymentToken,
              priceInUSD: token_1155.priceInUSD,
              lastSalePrice: token_1155.lastSalePrice,
              lastSalePricePaymentToken: token_1155.lastSalePricePaymentToken,
              lastSalePriceInUSD: token_1155.lastSalePriceInUSD,
              viewed: token_1155.viewed,
              contractAddress: token_1155.contractAddress,
              tokenID: token_1155.tokenID,
              tokenURI: token_1155.tokenURI,
              thumbnailPath: token_1155.thumbnailPath,
              imageURL: token_1155.imageURL,
              tokenType: token_1155.tokenType,
              name: token_1155.name,
              symbol: token_1155.symbol,
              liked: token_1155.liked,
              createdAt: token_1155.createdAt,
              saleEndsAt: token_1155.saleEndsAt,
              isAppropriate: token_1155.isAppropriate,
              holderSupply: holdingSupplies.get(
                token_1155.contractAddress + token_1155.tokenID
              )
            });
        });
        let allTokens = [...tokens_721, ...tokens_1155];
        return allTokens;
      } else {
        /*
        when status option
         */
        /* minter filter */
        let minterFilters = {
          ...(collections2filter != null
            ? { minter: { $in: [...collections2filter] } }
            : {})
        };
        let statusFilteredTokens = [];
        if (filters.includes('hasBids')) {
          /* for buy now - pick from Bid */
          let tokens = await Bid.find(minterFilters).select([
            'minter',
            'tokenID'
          ]);
          if (tokens) {
            tokens.map((pair) => {
              let minter_id_pair = [pair.minter, pair.tokenID];
              statusFilteredTokens.push(minter_id_pair);
            });
          }
        }
        if (filters.includes('buyNow')) {
          /* for had bids - pick from Listing */
          let tokens = await Listing.find(minterFilters).select([
            'minter',
            'tokenID'
          ]);
          if (tokens) {
            tokens.map((pair) => {
              let minter_id_pair = [pair.minter, pair.tokenID];
              statusFilteredTokens.push(minter_id_pair);
            });
          }
        }
        if (filters.includes('hasOffers')) {
          /* for has offers - pick from Offer */
          let tokens = await Offer.find(minterFilters).select([
            'minter',
            'tokenID'
          ]);
          if (tokens) {
            tokens.map((pair) => {
              let minter_id_pair = [pair.minter, pair.tokenID];
              statusFilteredTokens.push(minter_id_pair);
            });
          }
        }
        if (filters.includes('onAuction')) {
          /* for on auction - pick from Auction */
          let tokens = await Auction.find(minterFilters).select([
            'minter',
            'tokenID'
          ]);
          if (tokens) {
            tokens.map((pair) => {
              let minter_id_pair = [pair.minter, pair.tokenID];
              statusFilteredTokens.push(minter_id_pair);
            });
          }
        }
        statusFilteredTokens = statusFilteredTokens.filter(
          ((t = {}), (a) => !(t[a] = a in t))
        );

        let allFilteredTokens721 = [];
        let allFilteredTokens1155 = [];
        let allFilteredTokens = [];
        let statusPromise = statusFilteredTokens.map(async (tk) => {
          let tokenCategory = tokenTypes.filter(
            (tokenType) => tokenType[0] == tk[0]
          );
          tokenCategory = tokenCategory[0];
          if (parseInt(tokenCategory[1]) == 721) {
            let token = await NFTITEM.findOne({
              contractAddress: tk[0],
              tokenID: tk[1],
              owner: wallet
            }).select(selectOption);
            if (token) allFilteredTokens721.push(token);
          } else if (parseInt(tokenCategory[1]) == 1155) {
            let token = await NFTITEM.findOne({
              contractAddress: tk[0],
              tokenID: tk[1]
            }).select(selectOption);
            if (token) {
              if (
                isIncludedInArray(holders, [
                  token.contractAddress,
                  token.tokenID
                ])
              )
                allFilteredTokens1155.push(token);
            }
          }
        });
        await Promise.all(statusPromise);
        allFilteredTokens = [...allFilteredTokens721, ...allFilteredTokens1155];
        return allFilteredTokens;
      }
    }
  } catch (error) {
    return null;
  }
};

const getBundleItemDetails = async (bundleItem) => {
  try {
    let nftItem = await NFTITEM.findOne({
      contractAddress: bundleItem.contractAddress,
      tokenID: bundleItem.tokenID
    });
    if (nftItem)
      return {
        imageURL: nftItem.imageURL,
        thumbnailPath: nftItem.thumbnailPath
      };
    else return {};
  } catch (error) {
    return {};
  }
};

const entailBundleInfoItems = async (bundleInfoItems) => {
  let details = [];
  let promise = bundleInfoItems.map(async (bundleInfoItem) => {
    let detail = await getBundleItemDetails(bundleInfoItem);
    details.push({
      ...bundleInfoItem._doc,
      ...detail
    });
  });
  await Promise.all(promise);
  return details;
};
const selectBundles = async (req, res) => {
  try {
    let collections2filter = null;
    let selectedCollections = req.body.collectionAddresses;
    let filters = req.body.filterby;
    let wallet = req.body.address;
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
        categories: category
      }).select('erc721Address');
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
          return [];
        }
      } else {
        collections2filter = categoryCollections;
      }
    }

    // if (!wallet) {
    if (filters == null) {
      /*
        when no status option
         */
      /* contract address filter */
      let collectionFilters = {
        ...(collections2filter != null
          ? { contractAddress: { $in: [...collections2filter] } }
          : {})
      };

      let bundleInfos = await BundleInfo.find(collectionFilters);
      bundleInfos = await entailBundleInfoItems(bundleInfos);

      let bundleIDs = [];
      bundleInfos.map((bundleInfo) => {
        if (!bundleIDs.includes(bundleInfo.bundleID)) {
          bundleIDs.push(bundleInfo.bundleID);
        }
      });

      let bundleFilter = {
        ...(wallet != null ? { owner: { $regex: wallet, $options: 'i' } } : {}),
        ...{ _id: { $in: bundleIDs } }
      };

      let bundles = await Bundle.find(bundleFilter);

      let data = [];
      bundles.map((bundle) => {
        let bundleItems = bundleInfos.filter(
          (bundleInfo) =>
            bundleInfo.bundleID.toString() == bundle._id.toString()
        );
        data.push({
          viewed: bundle._doc.viewed,
          liked: bundle._doc.liked,
          price: bundle._doc.price,
          paymentToken: bundle._doc.paymentToken,
          priceInUSD: bundle._doc.priceInUSD,
          _id: bundle._doc._id,
          name: bundle._doc.name,
          lastSalePrice: bundle._doc.lastSalePrice,
          lastSalePricePaymentToken: bundle._doc.lastSalePricePaymentToken,
          lastSalePriceInUSD: bundle._doc.lastSalePriceInUSD,
          listedAt: bundle._doc.listedAt,
          soldAt: bundle._doc.soldAt,
          createdAt: bundle._doc.createdAt,
          items: bundleItems
        });
      });
      return data;
    } else if (filters.includes('buyNow') || filters.includes('onAuction')) {
      /*
        when no status option
         */
      /* contract address filter */
      let collectionFilters = {
        ...(collections2filter != null
          ? { contractAddress: { $in: [...collections2filter] } }
          : {})
      };

      let data = [];
      let filterBundleIDs = [];
      if (filters.includes('buyNow')) {
        let listedBundles = await BundleListing.find().select(['bundleID']);
        let listedBundleIDs = listedBundles.map(
          (listedBundle) => listedBundle.bundleID
        );
        filterBundleIDs = [...filterBundleIDs, ...listedBundleIDs];
      }
      if (filters.includes('hasOffers')) {
        let offerBundles = await BundleOffer.find().select(['bundleID']);
        let offerBundleIDs = offerBundles.map(
          (offerBundle) => offerBundle.bundleID
        );
        filterBundleIDs = [...filterBundleIDs, ...offerBundleIDs];
      }
      let bundleInfos = await BundleInfo.find(collectionFilters);
      bundleInfos = await entailBundleInfoItems(bundleInfos);
      let bundleIDs = [];
      bundleInfos.map((bundleInfo) => {
        if (!bundleIDs.includes(bundleInfo.bundleID)) {
          if (filterBundleIDs.includes(bundleInfo.bundleID))
            bundleIDs.push(bundleInfo.bundleID);
        }
      });
      let bundleFilter = {
        ...(wallet != null ? { owner: { $regex: wallet, $options: 'i' } } : {}),
        ...{ _id: { $in: bundleIDs } }
      };
      let bundles = await Bundle.find(bundleFilter);
      bundles.map((bundle) => {
        let bundleItems = bundleInfos.filter(
          (bundleInfo) => bundleInfo.bundleID == bundle._id
        );
        data.push({
          viewed: bundle._doc.viewed,
          liked: bundle._doc.liked,
          price: bundle._doc.price,
          paymentToken: bundle._doc.paymentToken,
          priceInUSD: bundle._doc.priceInUSD,
          _id: bundle._doc._id,
          name: bundle._doc.name,
          lastSalePrice: bundle._doc.lastSalePrice,
          lastSalePricePaymentToken: bundle._doc.lastSalePricePaymentToken,
          lastSalePriceInUSD: bundle._doc.lastSalePriceInUSD,
          listedAt: bundle._doc.listedAt,
          soldAt: bundle._doc.soldAt,
          createdAt: bundle._doc.createdAt,
          items: bundleItems
        });
      });
      return data;
    } else {
      /*
        when no status option
         */
      /* contract address filter */
      let collectionFilters = {
        ...(collections2filter != null
          ? { contractAddress: { $in: [...collections2filter] } }
          : {})
      };
      let bundleInfos = await BundleInfo.find(collectionFilters);
      bundleInfos = await entailBundleInfoItems(bundleInfos);
      let bundleIDs = [];
      bundleInfos.map((bundleInfo) => {
        if (!bundleIDs.includes(bundleInfo.bundleID)) {
          bundleIDs.push(bundleInfo.bundleID);
        }
      });
      let bundleFilter = {
        ...(wallet != null ? { owner: { $regex: wallet, $options: 'i' } } : {}),
        ...{ _id: { $in: bundleIDs } }
      };
      let bundles = await Bundle.find(bundleFilter);
      let data = [];
      bundles.map((bundle) => {
        let bundleItems = bundleInfos.filter(
          (bundleInfo) => bundleInfo.bundleID == bundle._id
        );
        bundleItems = bundleItems.map((bi) => ({
          bundleID: bi.bundleID,
          contractAddress: bi.contractAddress,
          imageURL: bi.imageURL,
          supply: bi.supply,
          thumbnailPath: bi.thumbnailPath,
          tokenID: bi.tokenID,
          tokenType: bi.tokenType,
          tokenURI: bi.tokenURI
        }));
        data.push({
          viewed: bundle._doc.viewed,
          liked: bundle._doc.liked,
          price: bundle._doc.price,
          paymentToken: bundle._doc.paymentToken,
          priceInUSD: bundle._doc.priceInUSD,
          _id: bundle._doc._id,
          name: bundle._doc.name,
          lastSalePrice: bundle._doc.lastSalePrice,
          lastSalePricePaymentToken: bundle._doc.lastSalePricePaymentToken,
          lastSalePriceInUSD: bundle._doc.lastSalePriceInUSD,
          listedAt: bundle._doc.listedAt,
          soldAt: bundle._doc.soldAt,
          createdAt: bundle._doc.createdAt,
          items: bundleItems
        });
      });
      return data;
    }
  } catch (error) {
    return null;
  }
};

router.post('/fetchTokens', async (req, res) => {
  let type = req.body.type; // type - item type
  let sortby = req.body.sortby; //sort -> string param
  let from = parseInt(req.body.from);
  let count = parseInt(req.body.count);
  console.log('log from fetch tokens');
  let items = [];
  if (type == 'all') {
    let nfts = await selectTokens(req, res);
    let bundles = await selectBundles(req, res);
    items = [...nfts, ...bundles];
  } else if (type == 'single') {
    items = await selectTokens(req, res);
  } else if (type == 'bundle') {
    items = await selectBundles(req, res);
  }

  items.map((item) => {
    item.price = formatPrice(item.price, item.paymentToken);
  });

  let updatedItems = updatePrices(items);

  let data = sortItems(updatedItems, sortby);

  let _searchResults = data.slice(from, from + count);

  let searchResults = _searchResults.map((sr) => ({
    ...(sr.contractAddress != null && sr.contractAddress != undefined
      ? { contractAddress: sr.contractAddress }
      : {}),
    ...(sr.imageURL != null && sr.imageURL != undefined
      ? { imageURL: sr.imageURL }
      : {}),
    ...(sr.name != null && sr.name != undefined ? { name: sr.name } : {}),
    ...(sr.price != null && sr.price != undefined ? { price: sr.price } : {}),
    ...(sr.paymentToken != null && sr.paymentToken != undefined
      ? { paymentToken: sr.paymentToken }
      : {}),
    ...(sr.priceInUSD != null && sr.priceInUSD != undefined
      ? { priceInUSD: sr.priceInUSD }
      : {}),
    ...(sr.supply != null && sr.supply != undefined
      ? { supply: sr.supply }
      : {}),
    ...(sr.thumbnailPath != null && sr.thumbnailPath != undefined
      ? { thumbnailPath: sr.thumbnailPath }
      : {}),
    ...(sr.tokenID != null && sr.tokenID != undefined
      ? { tokenID: sr.tokenID }
      : {}),
    ...(sr.tokenType != null && sr.tokenType != undefined
      ? { tokenType: sr.tokenType }
      : {}),
    ...(sr.tokenURI != null && sr.tokenURI != undefined
      ? { tokenURI: sr.tokenURI }
      : {}),
    ...(sr.items != null && sr.items != undefined ? { items: sr.items } : {}),
    ...(sr.liked != null && sr.liked != undefined ? { liked: sr.liked } : {}),
    ...(sr._id != null && sr._id != undefined ? { _id: sr._id } : {}),
    ...(sr.holderSupply != null && sr.holderSupply != undefined
      ? { holderSupply: sr.holderSupply }
      : {}),
    ...(sr.saleEndsAt != null && sr.saleEndsAt != undefined
      ? { saleEndsAt: sr.saleEndsAt }
      : {}),
    ...(sr.lastSalePrice != null && sr.lastSalePrice != undefined
      ? { lastSalePrice: sr.lastSalePrice }
      : {}),
    ...(sr.lastSalePricePaymentToken != null &&
    sr.lastSalePricePaymentToken != undefined
      ? { lastSalePricePaymentToken: sr.lastSalePricePaymentToken }
      : {}),
    ...(sr.lastSalePriceInUSD != null && sr.lastSalePriceInUSD != undefined
      ? { lastSalePriceInUSD: sr.lastSalePriceInUSD }
      : {}),
    ...(sr.isAppropriate != null && sr.isAppropriate != undefined
      ? { isAppropriate: sr.isAppropriate }
      : { isAppropriate: false })
  }));

  return res.json({
    status: 'success',
    data: {
      tokens: searchResults,
      total: data.length
    }
  });
});

const parseAddress = (data) => {
  let length = data.length;
  return data.substring(0, 2) + data.substring(length - 40);
};

router.post('/transfer721History', async (req, res) => {
  try {
    let tokenID = parseInt(req.body.tokenID);
    let address = toLowerCase(req.body.address);
    let history = await fetchTransferHistory721(address, tokenID);
    return res.json({
      status: 'success',
      data: history
    });
  } catch (error) {
    console.log(error);
    return res.json({
      status: 'failed'
    });
  }
});

router.post('/transfer1155History', async (req, res) => {
  try {
    let tokenID = parseInt(req.body.tokenID);
    let address = toLowerCase(req.body.address);
    let history = await fetchTransferHistory1155(address, tokenID);
    return res.json({
      status: 'success',
      data: history
    });
  } catch (error) {
    return res.json({
      status: 'failed'
    });
  }
});

router.post('/getSingleItemDetails', async (req, res) => {
  try {
    let contractAddress = toLowerCase(req.body.contractAddress);
    let tokenID = parseInt(req.body.tokenID);
    let category = await Category.findOne({ minterAddress: contractAddress });
    // token type
    let tokenType = category ? category.type : 721;
    let nft = await NFTITEM.findOne({
      contractAddress: contractAddress,
      tokenID: tokenID,
      isAppropriate: true
    });
    if (!nft)
      return res.json({
        status: 'failed'
      });
    // content type
    let contentType = nft.contentType;
    // likes count
    let likes = nft ? nft.liked : 0;
    // token uri
    let uri = nft ? nft.tokenURI : '';
    // get listings
    let listings = [];
    let _listings = await Listing.find({
      minter: contractAddress,
      tokenID: tokenID
    });
    let listingPromise = _listings.map(async (list) => {
      let account = await getAccountInfo(list.owner);
      listings.push({
        quantity: list.quantity,
        startTime: list.startTime,
        owner: list.owner,
        minter: list.minter,
        tokenID: list.tokenID,
        price: list.price,
        priceInUSD: list.priceInUSD,
        paymentToken: list.paymentToken,
        alias: account ? account[0] : null,
        image: account ? account[1] : null
      });
    });
    await Promise.all(listingPromise);
    listings = orderBy(listings, 'price', 'asc');

    // get offers
    let offers = [];

    let _offers = await Offer.find({
      minter: { $regex: new RegExp(contractAddress, 'i') },
      tokenID: tokenID
    });
    let offerPromise = _offers.map(async (offer) => {
      let account = await getAccountInfo(offer.creator);
      offers.push({
        creator: offer.creator,
        minter: offer.minter,
        tokenID: offer.tokenID,
        quantity: offer.quantity,
        pricePerItem: offer.pricePerItem,
        paymentToken: offer.paymentToken,
        priceInUSD: offer.priceInUSD,
        deadline: offer.deadline,
        alias: account ? account[0] : null,
        image: account ? account[1] : null
      });
    });
    await Promise.all(offerPromise);
    // get trade history
    let _history = await TradeHistory.find({
      collectionAddress: { $regex: new RegExp(contractAddress, 'i') },
      tokenID: tokenID
    })
      .select([
        'from',
        'to',
        'tokenID',
        'price',
        'paymentToken',
        'priceInUSD',
        'value',
        'createdAt',
        'isAuction'
      ])
      .sort({ createdAt: 'desc' });
    let history = [];

    let historyPromise = _history.map(async (hist) => {
      let sender = await getAccountInfo(hist.from);
      let receiver = await getAccountInfo(hist.to);

      let finalPrice = hist.price * getPrice(hist.paymentToken);

      history.push({
        from: hist.from,
        to: hist.to,
        tokenID: hist.tokenID,
        price: hist.price,
        paymentToken: hist.paymentToken,
        priceInUSD: finalPrice,
        value: hist.value,
        createdAt: hist.createdAt,
        isAuction: hist.isAuction,
        fromAlias: sender ? sender[0] : null,
        fromImage: sender ? sender[1] : null,
        toAlias: receiver ? receiver[0] : null,
        toImage: receiver ? receiver[1] : null
      });
    });
    await Promise.all(historyPromise);
    // more from this collection
    let nfts = await NFTITEM.find({
      contractAddress: contractAddress,
      tokenID: { $ne: tokenID },
      isAppropriate: true
    })
      .sort({ viewed: 'desc' })
      .limit(10)
      .select([
        'thumbnailPath',
        'supply',
        'price',
        'paymentToken',
        'priceInUSD',
        'tokenType',
        'tokenID',
        'tokenURI',
        'name',
        'imageURL',
        'liked',
        'contractAddress',
        'isAppropriate',
        'lastSalePrice',
        'lastSalePricePaymentToken',
        'lastSalePriceInUSD',
        'saleEndsAt'
      ]);
    let hasUnlockable = await UnlockableContents.findOne({
      contractAddress: contractAddress,
      tokenID: tokenID
    });
    hasUnlockable = hasUnlockable ? true : false;
    return res.json({
      status: 'success',
      data: {
        tokenType,
        likes,
        uri,
        listings,
        offers,
        history,
        nfts,
        contentType,
        hasUnlockable
      }
    });
  } catch (error) {
    console.log(error);
    return res.json({
      status: 'failed'
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
      ethers.utils.id('Transfer(address,address,uint256)'),
      null,
      null,
      ethers.utils.hexZeroPad(tokenID, 32)
    ]
  });

  let history = [];
  let promise = evts.map(async (evt) => {
    let from = parseAddress(evt.topics[1]);
    let to = parseAddress(evt.topics[2]);
    let blockNumber = evt.blockNumber;
    let blockTime = await getBlockTime(blockNumber);
    let sender = await getAccountInfo(from);
    let receiver = await getAccountInfo(to);
    history.push({
      from,
      to,
      createdAt: blockTime,
      fromAlias: sender ? sender[0] : null,
      fromImage: sender ? sender[1] : null,
      toAlias: receiver ? receiver[0] : null,
      toImage: receiver ? receiver[1] : null
    });
  });
  await Promise.all(promise);
  return history;
};
const parseSingleTrasferData = (data) => {
  return [
    parseInt(data.substring(0, 66), 16),
    parseInt(data.substring(66), 16)
  ];
};

const fetchTransferHistory1155 = async (address, id) => {
  let singleTransferEvts = await provider.getLogs({
    address: address,
    fromBlock: 0,
    topics: [
      ethers.utils.id(
        'TransferSingle(address,address,address,uint256,uint256)'
      ),
      null,
      null,
      null,
      null,
      null
    ]
  });
  let batchTransferEvts = await provider.getLogs({
    address: address,
    fromBlock: 0,
    topics: [
      ethers.utils.id(
        'TransferBatch(address,address,address,uint256[],uint256[])'
      ),
      null,
      null,
      null,
      null,
      null
    ]
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
      let from = toLowerCase(parseAddress(topics[2]));
      let to = toLowerCase(parseAddress(topics[3]));
      let sender = await getAccountInfo(from);
      let receiver = await getAccountInfo(to);
      history.push({
        from,
        to,
        createdAt: blockTime,
        tokenID,
        value: tokenTransferValue,
        fromAlias: sender ? sender[0] : null,
        fromImage: sender ? sender[1] : null,
        toAlias: receiver ? receiver[0] : null,
        toImage: receiver ? receiver[1] : null
      });
    }
  });
  await Promise.all(singplePromise);

  let batchPromise = batchTransferEvts.map(async (evt) => {
    let data = evt.data;
    let topics = evt.topics;
    let tokenIDs = parseBatchTransferData(data);
    if (tokenIDs.includes(id)) {
      let from = toLowerCase(parseAddress(topics[2]));
      let to = toLowerCase(parseAddress(topics[3]));
      let sender = await getAccountInfo(from);
      let receiver = await getAccountInfo(to);
      let blockNumber = evt.blockNumber;
      let blockTime = null;
      let _batchPromise = tokenIDs.map(async (tokenID) => {
        if (parseInt(tokenID) == parseInt(id)) {
          if (blockTime == null) blockTime = await getBlockTime(blockNumber);
          history.push({
            from,
            to,
            createdAt: blockTime,
            tokenID,
            fromAlias: sender ? sender[0] : null,
            fromImage: sender ? sender[1] : null,
            toAlias: receiver ? receiver[0] : null,
            toImage: receiver ? receiver[1] : null
          });
        }
      });
      await Promise.all(_batchPromise);
    }
  });
  await Promise.all(batchPromise);
  // process batch transfer event logs
  let _history = orderBy(history, 'blockTime', 'asc');
  return _history;
};

const getAccountInfo = async (address) => {
  try {
    let account = await Account.findOne({ address: address });
    if (account) {
      return [account.alias, account.imageHash];
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
};

module.exports = router;
