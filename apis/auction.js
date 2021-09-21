require("dotenv").config();
const router = require("express").Router();
const service_auth = require("./middleware/auth.tracker");
const mongoose = require("mongoose");
const ethers = require("ethers");

const Auction = mongoose.model("Auction");
const Account = mongoose.model("Account");
const Bid = mongoose.model("Bid");
const NFTITEM = mongoose.model("NFTITEM");
const TradeHistory = mongoose.model("TradeHistory");
const EventDeadLetterQueue = mongoose.model("EventDeadLetterQueue");
// const NotificationSetting = mongoose.model("NotificationSetting");

// const sendEmail = require("../mailer/auctionMailer");
// const getCollectionName = require("../mailer/utils");
// const notifications = require("../mailer/followMailer");
const toLowerCase = require("../utils/utils");
// const { getPrice } = require("../services/price.feed");
const AuctionContractAbi = require('../constants/auctionabi');
// const CollectionFactoryContract = require("../constants/factory_abi");
const PAYTOKENS = require('../constants/tokens');

const provider = new ethers.providers.JsonRpcProvider(
  process.env.NETWORK_RPC,
  parseInt(process.env.NETWORK_CHAINID)
);
const ownerWallet = new ethers.Wallet(process.env.ROAYLTY_PK, provider);

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

router.post("/auctionCreated", service_auth, async (req, res) => {
  try {
      const { event: eventName, blockNumber, transactionHash, transactionIndex, logIndex, args } = req.body;
      const [ nftAddress, tokenIdBN, payToken ] = args;
      const tokenId = parseInt(tokenIdBN.hex)
      const auctionPayToken = PAYTOKENS.find((token) => token.address === payToken.toLowerCase());
      const auction = await getAuction(nftAddress, parseInt(tokenId));

      if (!nftAddress || !tokenId || !auctionPayToken || !auction) {
        await EventDeadLetterQueue.create({ blockNumber, transactionHash, transactionIndex, logIndex, eventName, args: [ nftAddress, tokenId, payToken ] })
        return res.json({ failed: "missing data" });
      }

      // Delete existing auctions for NFT
      await Auction.deleteMany({
        minter: nftAddress,
        tokenID: tokenId,
      });

      // Save new auction for NFT
      const newAuction = {
        minter: nftAddress,
        tokenID: tokenId,
        bidder: 0,
        paymentToken: auctionPayToken.symbol,
        transactionHash,
        startTime: new Date(parseInt(auction._startTime) * 1000),
        endTime: new Date(parseInt(auction._endTime) * 1000),
        reservePrice: ethers.utils.formatUnits(auction._reservePrice.toString(), auctionPayToken.decimals),
      }

      await Auction.create(newAuction);

      // TODO: no idea why saving endTime in token this is needed
      const updateToken = await NFTITEM.findOne({
        contractAddress: nftAddress,
        tokenID: tokenId,
      });
      if (updateToken) {
        updateToken.saleEndsAt = parseInt(auction._endTime.toString()) * 1000;
        await updateToken.save();
      }

      // TODO: notifying users is disabled
      // notify followers
      // notifications.notifyNewAuction(nftAddress, tokenID);

      return res.json({status: "success"});
    } catch (err) {
      console.error(err);
      return res.json({status: "failed", error: err})
    }
});

router.post("/auctionCancelled", service_auth, async (req, res) => {
  try {
    const { event: eventName, blockNumber, transactionHash, transactionIndex, logIndex, args } = req.body;
    const [ nftAddress, tokenIdBN ] = args;
    const tokenId = parseInt(tokenIdBN.hex)

    if (!nftAddress || !tokenId) {
      await EventDeadLetterQueue.create({ blockNumber, transactionHash, transactionIndex, logIndex, eventName, args: [ nftAddress, tokenId ] })
      return res.json({ failed: "missing data" });
    }

    // Delete auction, update bids & token endtime
    await Auction.deleteMany({
      minter: nftAddress,
      tokenID: tokenId,
    });
    await Bid.updateMany({
      minter: nftAddress,
      tokenID: tokenId,
    }, { auctionActive: false, winningBid: false });

    const token = await NFTITEM.findOne({
      contractAddress: nftAddress,
      tokenID: tokenId,
    });
    if (token) {
      token.saleEndsAt = null;
      await token.save();
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

    return res.json({ status: "success"});
  } catch (error) {
    console.error(error);
    return res.json({ status: "failed", error });
  }
});

router.post("updateAuctionStartTime", service_auth, async (req, res) => {
  try {
    const { event: eventName, blockNumber, transactionHash, transactionIndex, logIndex, args } = req.body;
    const [ nftAddress, tokenIdBN, startTimeBN ] = args;
    const tokenId = parseInt(tokenIdBN.hex)
    const startTime = parseInt(startTimeBN.hex)

    if (!nftAddress || !tokenId || !startTimeBN) {
      await EventDeadLetterQueue.create({ blockNumber, transactionHash, transactionIndex, logIndex, eventName, args: [ nftAddress, tokenId, startTime ] })
      return res.json({ failed: "missing data" });
    }

      let auction = await Auction.findOne({
        minter: nftAddress,
        tokenID: tokenId,
      });
      if (auction) {
        auction.startTime = new Date(parseInt(startTime) * 1000);
        await auction.save();
      }
    return res.json({ status: "success"});
  } catch (error) {
    console.error(error);
    return res.json({ status: "failed", error });
  }
});

router.post("updateAuctionEndTime", service_auth, async (req, res) => {
  try {
    const { event: eventName, blockNumber, transactionHash, transactionIndex, logIndex, args } = req.body;
    const [ nftAddress, tokenIdBN, endTimeBN ] = args;
    const tokenId = parseInt(tokenIdBN.hex)
    const endTime = parseInt(endTimeBN.hex)

    if (!nftAddress || !tokenId || !endTimeBN) {
      await EventDeadLetterQueue.create({ blockNumber, transactionHash, transactionIndex, logIndex, eventName, args: [ nftAddress, tokenId, endTime ] })
      return res.json({ failed: "missing data" });
    }

    let auction = await Auction.findOne({
      minter: nftAddress,
      tokenID: tokenId,
    });
    if (auction) {
      auction.endtime = new Date(parseInt(endTime) * 1000);
      await auction.save();
    }

    const updateToken = await NFTITEM.findOne({
      contractAddress: nftAddress,
      tokenID: tokenId,
    });

    //TODO is this needed?
    if (updateToken) {
      updateToken.saleEndsAt = parseInt(endTime) * 1000;
      await updateToken.save();
    }

    return res.json({ status: "success"});
  } catch (error) {
    console.error(error);
    return res.json({ status: "failed", error });
  }
});

router.post("/updateAuctionReservePrice", service_auth, async (req, res) => {
  try {
    const { event: eventName, blockNumber, transactionHash, transactionIndex, logIndex, args } = req.body;
    const [ nftAddress, tokenIdBN, payToken, reservePriceBN ] = args;
    const tokenId = parseInt(tokenIdBN.hex)
    const auctionPayToken = PAYTOKENS.find((token) => token.address === payToken.toLowerCase());
    const reservePrice = auctionPayToken && ethers.utils.formatUnits(ethers.BigNumber.from(reservePriceBN.hex), auctionPayToken.decimals);

    if (!nftAddress || !tokenId || !auctionPayToken || !reservePrice) {
      await EventDeadLetterQueue.create({ blockNumber, transactionHash, transactionIndex, logIndex, eventName, args: [ nftAddress, tokenId, payToken, reservePrice ] })
      return res.json({ failed: "missing data" });
    }

    const auction = await Auction.findOne({
      minter: nftAddress,
      tokenID: tokenId,
    });
    if (auction) {
      auction.reservePrice = reservePrice;
      await auction.save();
    }
    return res.json({ status: "success"});
  } catch (error) {
    console.error(error);
    return res.json({ status: "failed", error });
  }
});

router.post("/bidPlaced", service_auth, async (req, res) => {
  try {
    const { event: eventName, blockNumber, transactionHash, transactionIndex, logIndex, args } = req.body;
    const [ nftAddress, tokenIdBN, bidder, bidBN ] = args;
    const tokenId = parseInt(tokenIdBN.hex)

    const auction = await Auction.findOne({
      minter: nftAddress,
      tokenID: tokenId,
    });

    const auctionPayToken = PAYTOKENS.find((token) => token.symbol === auction?.paymentToken);
    const bid = auctionPayToken && ethers.utils.formatUnits(ethers.BigNumber.from(bidBN.hex), auctionPayToken.decimals);

    if (!nftAddress || !tokenId || !bidder || !bid || !auction) {
      await EventDeadLetterQueue.create({ blockNumber, transactionHash, transactionIndex, logIndex, eventName, args: [ nftAddress, tokenId, payToken, reservePrice ] })
      return res.json({ failed: "missing data" });
    }

    // Current winning bid to false
    await Bid.updateMany({
      minter: nftAddress,
      tokenID: tokenId,
      auctionActive: true,
    }, { winningBid: false })

    // Create new winning bid
    const createBid = {
      minter: nftAddress,
      tokenID: tokenId,
      bidder,
      bid,
      paymentToken: auction.paymentToken,
      auctionActive: true,
      winningBid: true,
    }
    await Bid.create(createBid);

    return res.json({status: "success"});
  } catch (error) {
    console.error(error);
    return res.json({ status: "failed", error });
  }
});

router.post("/bidWithdrawn", service_auth, async (req, res) => {
  try {
    const { event: eventName, blockNumber, transactionHash, transactionIndex, logIndex, args } = req.body;
    const [ nftAddress, tokenIdBN, bidder, bidBN ] = args;
    const tokenId = parseInt(tokenIdBN.hex)

    const auction = await Auction.findOne({
      minter: nftAddress,
      tokenID: tokenId,
    });

    const auctionPayToken = PAYTOKENS.find((token) => token.symbol === auction?.paymentToken);
    const bid = ethers.utils.formatUnits(ethers.BigNumber.from(bidBN.hex), auctionPayToken.decimals);

    if (!nftAddress || !tokenId || !bidder || !bidBN || !auction) {
      await EventDeadLetterQueue.create({ blockNumber, transactionHash, transactionIndex, logIndex, eventName, args: [ nftAddress, tokenId, payToken, reservePrice ] })
      return res.json({ failed: "missing data" });
    }

    await Bid.updateOne({minter: nftAddress, tokenID: tokenId, bidder, bid }, { withdrawn: true })

    return res.json({status: "success"});
  } catch (error) {
    console.error(error);
    return res.json({ status: "failed", error });
  }
});

router.post("/auctionResulted", service_auth, async (req, res) => {
  try {
    const { event: eventName, blockNumber, transactionHash, transactionIndex, logIndex, args } = req.body;
    const [ nftAddress, tokenIdBN, winner, paymentToken, unitPriceBN, winningBidBN ] = args;
    const tokenId = parseInt(tokenIdBN.hex)

    const auctionPayToken = PAYTOKENS.find((token) => token.symbol === paymentToken.toLowerCase());
    const winningBid = ethers.utils.formatUnits(ethers.BigNumber.from(winningBidBN.hex), auctionPayToken.decimals);
    const unitPrice = ethers.utils.formatUnits(ethers.BigNumber.from(unitPriceBN.hex), auctionPayToken.decimals);

    if (!nftAddress || !tokenId || !winningBid) {
      await EventDeadLetterQueue.create({ blockNumber, transactionHash, transactionIndex, logIndex, eventName, args: [ nftAddress, tokenId, winner, paymentToken, unitPrice, winningBid ] })
      return res.json({ failed: "missing data" });
    }

    // Delete auction, update bids & token endtime
    await Auction.deleteMany({
      minter: nftAddress,
      tokenID: tokenId,
    });
    await Bid.updateMany({
      minter: nftAddress,
      tokenID: tokenId,
      bidder: { $ne: winningBid }
    }, { auctionActive: false, winningBid: false });
    await Bid.updateOne({
      minter: nftAddress,
      tokenID: tokenId,
      bidder: winningBid,
    }, { auctionActive: false });

    const token = await NFTITEM.findOne({
      contractAddress: nftAddress,
      tokenID: tokenID,
    });
    if (token) {
      token.price = winningBid;
      token.paymentToken = paymentToken;
      token.priceInUSD = unitPrice;
      token.lastSalePrice = winningBid;
      token.lastSalePricePaymentToken = paymentToken;
      token.lastSalePriceInUSD = unitPrice * winningBid;
      token.soldAt = new Date();
      // update sale ends at as well
      token.saleEndsAt = null;
      await token.save();

      const from = token.owner;
      const history = new TradeHistory();
      history.collectionAddress = nftAddress;
      history.tokenID = tokenID;
      history.from = from;
      history.to = winner;
      history.price = winningBid;
      history.paymentToken = paymentToken;
      history.priceInUSD = unitPrice;
      history.isAuction = true;
      await history.save();
    }

    return res.json({ status: "success"});
  } catch (error) {
    console.error(error);
    return res.json({ status: "failed", error });
  }
});

router.post("/bidRefunded", service_auth, async (req, res) => {
  // TODO do we need history for this
  try {
    // let nft = toLowerCase(req.body.nft);
    // let tokenID = parseInt(req.body.tokenID);
    // let bidder = toLowerCase(req.body.bidder);
    // let bid = parseFloat(req.body.bid);
    // notify user that his bid is refunded
    return res.json({});
  } catch (error) {
    return res.json({ status: "failed" });
  }
});

module.exports = router;
