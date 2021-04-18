require("dotenv").config();
const { default: axios } = require("axios");
const mongoose = require("mongoose");
const contractutils = require("./contract.utils");

require("../models/bid");

const trackAuction = async () => {
  let address = "";
  let contract = await contractutils.loadContractFromAddress(address);
  if (!contract) return null;

  contract.on("PauseToggled", async (isPaused) => {});
  contract.on("AuctionCreated", async (nftAddress, tokenId) => {});
  contract.on(
    "UpdateAuctionEndTime",
    async (nftAddress, tokenId, endTime) => {}
  );
  contract.on(
    "UpdateAuctionStartTime",
    async (nftAddress, tokenId, startTime) => {}
  );
  contract.on(
    "UpdateAuctionReservePrice",
    async (nftAddress, tokenId, reservePrice) => {}
  );
  contract.on("UpdatePlatformFee", async (platformFee) => {});
  contract.on("UpdatePlatformFeeRecipient", async (platformFeeRecipient) => {});
  contract.on("UpdateMinBidIncrement", async (minBidIncrement) => {});
  contract.on(
    "UpdateBidWithdrawalLockTime",
    async (bidWithdrawalLockTime) => {}
  );
  contract.on(
    "BidPlaced",
    async (nftAddress, nftAddress, bidder, bidder) => {}
  );
  contract.on(
    "BidWithdrawn",
    async (nftAddress, nftAddress, bidder, bidder) => {}
  );
  contract.on("BidRefunded", async (bidder, bid) => {});
  contract.on(
    "AuctionResulted",
    async (nftAddress, tokenId, winner, winningBid) => {}
  );
  contract.on("AuctionCancelled", async (nftAddress, tokenId) => {});
};

const auctionTracker = {
  trackAuction,
};

module.exports = auctionTracker;
