require('dotenv').config();
const router = require('express').Router();
const service_auth = require('./middleware/auth.tracker');
const mongoose = require('mongoose');
const ethers = require('ethers');

const Auction = mongoose.model('Auction');
const Account = mongoose.model('Account');
const Bid = mongoose.model('Bid');
const NFTITEM = mongoose.model('NFTITEM');
const TradeHistory = mongoose.model('TradeHistory');
// const NotificationSetting = mongoose.model("NotificationSetting");

// const sendEmail = require("../mailer/auctionMailer");
// const getCollectionName = require("../mailer/utils");
// const notifications = require("../mailer/followMailer");
// const { getPrice } = require("../services/price.feed");
const AuctionContractAbi = require('../constants/auctionabi');
// const CollectionFactoryContract = require("../constants/factory_abi");
const { PAYTOKENS, DISABLED_PAYTOKENS } = require('../constants/tokens');
const { getPrice } = require('../services/price.feed');

const provider = new ethers.providers.JsonRpcProvider(
  process.env.NETWORK_RPC,
  parseInt(process.env.NETWORK_CHAINID)
);
const ownerWallet = new ethers.Wallet(process.env.ROYALTY_PK, provider);

const AuctionContractAddress = process.env.AUCTION_ADDRESS;
const auctionSC = new ethers.Contract(
  AuctionContractAddress,
  AuctionContractAbi,
  ownerWallet
);

// const get721ItemName = async (nft, tokenID) => {
//   try {
//     let token = await NFTITEM.findOne({
//       contractAddress: toLowerCase(nft),
//       tokenID: tokenID,
//     });
//     if (token) return token.name;
//     else return tokenID;
//   } catch (error) {
//     return tokenID;
//   }
// };
//
// const getUserAlias = async (walletAddress) => {
//   try {
//     let account = await Account.findOne({ address: walletAddress });
//     if (account) return account.alias;
//     else return walletAddress;
//   } catch (error) {
//     return walletAddress;
//   }
// };

const getAuction = async (nftAddress, tokenID) => {
  try {
    return auctionSC.getAuction(nftAddress, tokenID);
  } catch (error) {
    return null;
  }
};

router.post('/auctionCreated', service_auth, async (req, res) => {
  try {
    const { args, blockNumber, transactionHash } = req.body;
    const [nftC, tokenIdBN, paytokenC] = args;

    const nftAddress = nftC.toLowerCase();
    const tokenId = parseInt(tokenIdBN.hex);
    const auctionPayToken = [...PAYTOKENS, ...DISABLED_PAYTOKENS].find(
      (token) => token.address.toLowerCase() === paytokenC.toLowerCase()
    );

    const auction = await getAuction(nftAddress, parseInt(tokenId));

    try {
      // Delete existing auctions for NFT
      await Auction.deleteMany({
        minter: nftAddress,
        tokenID: tokenId,
        blockNumber: { $lt: blockNumber }
      });

      const existingAuction = await Auction.find({
        minter: nftAddress,
        tokenID: tokenId
      });

      // Save new auction for NFT
      if (!existingAuction.length) {
        const reservePrice = ethers.utils.formatUnits(
          auction._reservePrice.toString(),
          auctionPayToken.decimals
        );
        const priceInUSD = reservePrice * getPrice(auctionPayToken.address);

        const newAuction = {
          minter: nftAddress,
          tokenID: tokenId,
          bidder: 0,
          paymentToken: auctionPayToken.address,
          txHash: transactionHash,
          startTime: parseInt(auction._startTime) * 1000,
          endTime: new Date(parseInt(auction._endTime) * 1000),
          reservePrice,
          blockNumber
        };
        await Auction.create(newAuction);

        // TODO: no idea why saving endTime in token this is needed
        const updateToken = await NFTITEM.findOne({
          contractAddress: nftAddress,
          tokenID: tokenId
        });
        if (updateToken) {
          updateToken.saleEndsAt = parseInt(auction._endTime.toString()) * 1000;
          updateToken.price = reservePrice;
          updateToken.paymentToken = auctionPayToken.address;
          updateToken.priceInUSD = priceInUSD;
          updateToken.listedAt = new Date();

          await updateToken.save();
        }
      }
    } catch (error) {
      console.error(
        '[AuctionCreated] Failed to create new auction: ',
        error.message
      );
    }

    // TODO: notifying users is disabled
    // notify followers
    // notifications.notifyNewAuction(nftAddress, tokenID);

    console.info('[AuctionCreated] Success: ', {
      transactionHash,
      blockNumber
    });
    return res.json({ status: 'success' });
  } catch (error) {
    console.info('[AuctionCreated] Failed!: ', {
      transactionHash: req.body.transactionHash,
      blockNumber: req.body.blockNumber
    });
    console.error({ error });

    return res.status(400).json({ status: 'failed', error });
  }
});

router.post('/auctionCancelled', service_auth, async (req, res) => {
  try {
    const { blockNumber, transactionHash, args } = req.body;
    const [nftAddressC, tokenIdBN] = args;

    const nftAddress = nftAddressC.toLowerCase();
    const tokenId = parseInt(tokenIdBN.hex);

    // Delete auction, update bids & token endtime
    const result = await Auction.deleteMany({
      minter: nftAddress,
      tokenID: tokenId,
      blockNumber: { $lt: blockNumber }
    });

    await Bid.updateMany(
      {
        minter: nftAddress,
        tokenID: tokenId,
        blockNumber: { $lt: blockNumber }
      },
      { auctionActive: false, winningBid: false }
    );

    if (result.deletedCount > 0) {
      const token = await NFTITEM.findOne({
        contractAddress: nftAddress,
        tokenID: tokenId
      });
      if (token) {
        token.price = 0;
        token.paymentToken = 'ftm';
        token.priceInUSD = 0;
        token.saleEndsAt = new Date();
        token.listedAt = new Date(0);
        await token.save();
      }
    }

    // TODO enable notifications
    // const bid = await Bid.findOne({
    //   minter: nftAddress,
    //   tokenID: tokenID,
    // });
    // if (bid) {
    //   let bidder = bid.bidder;
    //   let account = await Account.findOne({ address: bidder });
    //   // check if user listens
    //   let ns = await NotificationSetting.findOne({ address: bidder });
    //   if (account && ns.sAuctionOfBidCancel) {
    //     let to = account.email;
    //     let alias = account.alias;
    //     let collectionName = await getCollectionName(nftAddress);
    //     let tokenName = await get721ItemName(nftAddress, tokenID);
    //     let data = {
    //       type: "auction",
    //       to: to,
    //       event: "AuctionCancelled",
    //       subject: "Auction cancelled!",
    //       alias: alias,
    //       collectionName: collectionName,
    //       tokenName: tokenName,
    //       tokenID: tokenID,
    //       nftAddress: nftAddress,
    //     };
    //     sendEmail(data);
    //   }
    // }

    console.info('[AuctionCancelled] Success: ', {
      transactionHash,
      blockNumber
    });
    return res.json({ status: 'success' });
  } catch (error) {
    console.info('[AuctionCancelled] Failed!: ', {
      transactionHash: req.body.transactionHash,
      blockNumber: req.body.blockNumber
    });
    console.error({ error });

    return res.status(400).json({ status: 'failed', error });
  }
});

router.post('/updateAuctionStartTime', service_auth, async (req, res) => {
  try {
    const { blockNumber, transactionHash, args } = req.body;
    const [nftAddressC, tokenIdBN, startTimeBN] = args;

    const nftAddress = nftAddressC.toLowerCase();
    const tokenId = parseInt(tokenIdBN.hex);
    const startTime = parseInt(startTimeBN.hex) * 1000;

    const auction = await Auction.findOne({
      minter: nftAddress,
      tokenID: tokenId,
      blockNumber: { $lt: blockNumber }
    });
    if (auction) {
      auction.startTime = startTime;
      await auction.save();
    }

    console.info('[UpdateAuctionStartTime] Success: ', {
      transactionHash,
      blockNumber
    });
    return res.json({ status: 'success' });
  } catch (error) {
    console.info('[UpdateAuctionStartTime] Failed!: ', {
      transactionHash: req.body.transactionHash,
      blockNumber: req.body.blockNumber
    });
    console.error({ error });

    return res.status(400).json({ status: 'failed', error });
  }
});

router.post('/updateAuctionEndTime', service_auth, async (req, res) => {
  try {
    const { blockNumber, transactionHash, args } = req.body;
    const [nftAddressC, tokenIdBN, endTimeBN] = args;

    const nftAddress = nftAddressC.toLowerCase();
    const tokenId = parseInt(tokenIdBN.hex);
    const endTime = parseInt(endTimeBN.hex);

    let auction = await Auction.findOne({
      minter: nftAddress,
      tokenID: tokenId,
      blockNumber: { $lt: blockNumber }
    });
    if (auction) {
      auction.endtime = new Date(parseInt(endTime) * 1000);
      await auction.save();
    }

    const updateToken = await NFTITEM.findOne({
      contractAddress: nftAddress,
      tokenID: tokenId,
      blockNumber: { $lt: blockNumber }
    });

    //TODO is this needed?
    if (updateToken) {
      updateToken.saleEndsAt = parseInt(endTime) * 1000;
      await updateToken.save();
    }

    console.info('[UpdateAuctionEndTime] Success: ', {
      transactionHash,
      blockNumber
    });
    return res.json({ status: 'success' });
  } catch (error) {
    console.info('[UpdateAuctionEndTime] Failed!: ', {
      transactionHash: req.body.transactionHash,
      blockNumber: req.body.blockNumber
    });
    console.error({ error });

    return res.status(400).json({ status: 'failed', error });
  }
});

router.post('/updateAuctionReservePrice', service_auth, async (req, res) => {
  try {
    const { blockNumber, transactionHash, args } = req.body;
    const [nftAddressC, tokenIdBN, paytokenC, reservePriceBN] = args;
    const nftAddress = nftAddressC.toLowerCase();
    const tokenId = parseInt(tokenIdBN.hex);
    const auctionPayToken = [...PAYTOKENS, ...DISABLED_PAYTOKENS].find(
      (token) => token.address.toLowerCase() === paytokenC.toLowerCase()
    );
    const reservePrice =
      auctionPayToken &&
      ethers.utils.formatUnits(
        ethers.BigNumber.from(reservePriceBN.hex),
        auctionPayToken.decimals
      );

    const auction = await Auction.findOne({
      minter: nftAddress,
      tokenID: tokenId,
      blockNumber: { $lt: blockNumber }
    });
    if (auction) {
      auction.reservePrice = reservePrice;
      await auction.save();
    }

    const updateToken = await NFTITEM.findOne({
      contractAddress: nftAddress,
      tokenID: tokenId,
      blockNumber: { $lt: blockNumber }
    });

    //TODO is this needed?
    if (updateToken) {
      updateToken.price = reservePrice;
      await updateToken.save();
    }

    console.info('[UpdateAuctionReservePrice] Success: ', {
      transactionHash,
      blockNumber
    });
    return res.json({ status: 'success' });
  } catch (error) {
    console.info('[UpdateAuctionReservePrice] Failed!: ', {
      transactionHash: req.body.transactionHash,
      blockNumber: req.body.blockNumber
    });
    console.error({ error });

    return res.status(400).json({ status: 'failed', error });
  }
});

router.post('/auctionResulted', service_auth, async (req, res) => {
  try {
    const { blockNumber, transactionHash, args } = req.body;
    const [
      oldOwnerC,
      nftAddressC,
      tokenIdBN,
      winnerC,
      paytokenC,
      unitPriceBN,
      winningBidBN
    ] = args;

    const oldOwner = oldOwnerC.toLowerCase();
    const tokenId = parseInt(tokenIdBN.hex);
    const nftAddress = nftAddressC.toLowerCase();
    const winner = winnerC.toLowerCase();
    const auctionPayToken = [...PAYTOKENS, ...DISABLED_PAYTOKENS].find(
      (token) => token.address.toLowerCase() === paytokenC.toLowerCase()
    );
    const winningBid = ethers.utils.formatUnits(
      ethers.BigNumber.from(winningBidBN.hex),
      auctionPayToken.decimals
    );
    const unitPrice = ethers.utils.formatUnits(
      ethers.BigNumber.from(unitPriceBN.hex),
      auctionPayToken.decimals
    );

    // Delete auction, update bids & token endtime
    const result = await Auction.deleteMany({
      minter: nftAddress,
      tokenID: tokenId,
      blockNumber: { $lt: blockNumber }
    });
    await Bid.updateMany(
      {
        minter: nftAddress,
        tokenID: tokenId,
        bidder: { $ne: winner },
        blockNumber: { $lt: blockNumber }
      },
      { auctionActive: false, winningBid: false }
    );
    await Bid.updateOne(
      {
        minter: nftAddress,
        tokenID: tokenId,
        bidder: winner,
        blockNumber: { $lt: blockNumber }
      },
      { auctionActive: false }
    );

    if (result.deletedCount > 0) {
      const token = await NFTITEM.findOne({
        contractAddress: nftAddress,
        tokenID: tokenId
      });

      if (token) {
        token.price = 0;
        token.paymentToken = 'ftm';
        token.priceInUSD = 0;
        token.lastSalePrice = winningBid;
        token.lastSalePricePaymentToken = auctionPayToken.address;
        token.lastSalePriceInUSD = unitPrice * winningBid;
        token.soldAt = new Date();
        // update sale ends at as well
        token.saleEndsAt = new Date();
        token.listedAt = new Date(0);
        await token.save();

        const existingHistory = await TradeHistory.find({
          txHash: transactionHash
        });
        if (!existingHistory.length) {
          const history = new TradeHistory();
          history.collectionAddress = nftAddress;
          history.tokenID = tokenId;
          history.from = oldOwner;
          history.to = winner;
          history.price = winningBid;
          history.paymentToken = auctionPayToken.address;
          history.priceInUSD = unitPrice;
          history.isAuction = true;
          history.txHash = transactionHash;
          await history.save();
        }
      }
    }

    console.info('[AuctionResulted] Success: ', {
      transactionHash,
      blockNumber
    });
    return res.json({ status: 'success' });
  } catch (error) {
    console.info('[AuctionResulted] Failed!: ', {
      transactionHash: req.body.transactionHash,
      blockNumber: req.body.blockNumber
    });
    console.error({ error });

    return res.status(400).json({ status: 'failed', error });
  }
});

router.post('/bidPlaced', service_auth, async (req, res) => {
  try {
    const { blockNumber, transactionHash, args } = req.body;
    const [nftAddressC, tokenIdBN, bidderC, bidBN] = args;
    const nftAddress = nftAddressC.toLowerCase();
    const tokenId = parseInt(tokenIdBN.hex);
    const bidder = bidderC.toLowerCase();

    const auction = await Auction.findOne({
      minter: nftAddress,
      tokenID: tokenId,
      blockNumber: { $lt: blockNumber }
    });

    if (auction) {
      const auctionPayToken = [...PAYTOKENS, ...DISABLED_PAYTOKENS].find(
        (token) =>
          token.address.toLowerCase() ===
          (auction && auction.paymentToken.toLowerCase())
      );
      const bid =
        auctionPayToken &&
        ethers.utils.formatUnits(
          ethers.BigNumber.from(bidBN.hex),
          auctionPayToken.decimals
        );

      // Current winning bid to false
      await Bid.updateMany(
        {
          minter: nftAddress,
          tokenID: tokenId,
          auctionActive: true,
          blockNumber: { $lt: blockNumber }
        },
        { winningBid: false }
      );

      try {
        // Create new winning bid
        const identicalBid = await Bid.findOne({
          minter: nftAddress,
          tokenID: tokenId,
          bidder,
          txHash: transactionHash
        });

        if (!identicalBid) {
          const createBid = {
            minter: nftAddress,
            tokenID: tokenId,
            bidder,
            bid,
            paymentToken: auctionPayToken.address,
            auctionActive: true,
            winningBid: true,
            blockNumber,
            txHash: transactionHash
          };
          await Bid.create(createBid);
        }
      } catch (err) {
        console.error('[BidPlaced] Failed to create new bid: ', err.message);
      }
    }

    console.info('[BidPlaced] Success: ', { transactionHash, blockNumber });
    return res.json({ status: 'success' });
  } catch (error) {
    console.info('[BidPlaced] Failed!: ', {
      transactionHash: req.body.transactionHash,
      blockNumber: req.body.blockNumber
    });
    console.error({ error });

    return res.status(400).json({ status: 'failed', error });
  }
});

router.post('/bidWithdrawn', service_auth, async (req, res) => {
  try {
    const { blockNumber, transactionHash, args } = req.body;
    const [nftAddressC, tokenIdBN, bidderC, bidBN] = args;
    const nftAddress = nftAddressC.toLowerCase();
    const bidder = bidderC.toLowerCase();
    const tokenId = parseInt(tokenIdBN.hex);

    const auction = await Auction.findOne({
      minter: nftAddress,
      tokenID: tokenId,
      blockNumber: { $lt: blockNumber }
    });
    if (auction) {
      const auctionPayToken = [...PAYTOKENS, ...DISABLED_PAYTOKENS].find(
        (token) =>
          token.address.toLowerCase() === auction.paymentToken.toLowerCase()
      );
      const bid = ethers.utils.formatUnits(
        ethers.BigNumber.from(bidBN.hex),
        auctionPayToken.decimals
      );
      await Bid.updateOne(
        { minter: nftAddress, tokenID: tokenId, bidder, bid },
        { withdrawn: true, winningBid: false }
      );
    }

    console.info('[BidWithdrawn] Success: ', { transactionHash, blockNumber });
    return res.json({ status: 'success' });
  } catch (error) {
    console.info('[BidWithdrawn] Failed!: ', {
      transactionHash: req.body.transactionHash,
      blockNumber: req.body.blockNumber
    });
    console.error({ error });

    return res.status(400).json({ status: 'failed', error });
  }
});

router.post('/bidRefunded', service_auth, async (req, res) => {
  // TODO do we need history for this
  try {
    const { blockNumber, transactionHash } = req.body;
    // TODO what to do with this event? Do we want to process this?

    console.info('[BidRefunded] Success: ', { transactionHash, blockNumber });
    return res.json({ status: 'success' });
  } catch (error) {
    console.info('[BidRefunded] Failed!: ', {
      transactionHash: req.body.transactionHash,
      blockNumber: req.body.blockNumber
    });
    console.error({ error });

    return res.status(400).json({ status: 'failed', error });
  }
});

module.exports = router;
