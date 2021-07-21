const mongoose = require("mongoose");

const NotificationSetting = mongoose.Schema({
  address: { type: String, required: true }, //wallet address

  fNotification: { type: Boolean, default: true }, //listen for follower
  fBundleCreation: { type: Boolean, default: true }, //bundle creation
  fBundleList: { type: Boolean, default: true }, //bundle list
  fBundlePrice: { type: Boolean, default: true }, //bundle price update
  fNftAuctionPrice: { type: Boolean, default: true }, //nft auction price update
  fNftList: { type: Boolean, default: true }, //nft list
  fNftAuction: { type: Boolean, default: true }, //nft auction
  fNftPrice: { type: Boolean, default: true }, //nft price update

  sNotification: { type: Boolean, default: true }, //   self account activity
  sBundleBuy: { type: Boolean, default: true }, //bought a new bundle
  sBundleSell: { type: Boolean, default: true }, //sold a bundle
  sBundleOffer: { type: Boolean, default: true }, //bundle gets an offer
  sBundleOfferCancel: { type: Boolean, default: true }, //offer to your bundle cancelled
  sNftAuctionPrice: { type: Boolean, default: true }, //nft you bidded in auction has updated in price
  sNftBidToAuction: { type: Boolean, default: true }, //bid to your auction
  sNftBidToAuctionCancel: { type: Boolean, default: true }, //bid to your auction cancelled
  sAuctionWin: { type: Boolean, default: true }, //you wind the bid
  sAuctionOfBidCancel: { type: Boolean, default: true }, //auction with your bid has been cancelled
  sNftSell: { type: Boolean, default: true }, //you sold nft
  sNftBuy: { type: Boolean, default: true }, //you bought nft
  sNftOffer: { type: Boolean, default: true }, //your nft got an offer
  sNftOfferCancel: { type: Boolean, default: true }, //offer to your nft cancelled
});

NotificationSetting.methods.setFNotification = (flag) => {
  if (flag) this.fNotification = true;
  else {
    this.fNotification = false;
    this.fBundleCreation = false;
    this.fBundleList = false;
    this.fBundlePrice = false;
    this.fNftAuctionPrice = false;
    this.fNftList = false;
    this.fNftAuction = false;
    this.fNftPrice = false;
  }
};

NotificationSetting.methods.setSNotification = (flag) => {
  if (flag) this.sNotification = true;
  else {
    this.sNotification = false;
    this.sBundleBuy = false;
    this.sBundleSell = false;
    this.sBundleOffer = false;
    this.sBundleOfferCancel = false;
    this.sNftAuctionPrice = false;
    this.sNftBidToAuction = false;
    this.sNftBidToAuctionCancel = false;
    this.sAuctionWin = false;
    this.sAuctionOfBidCancel = false;
    this.sNftSell = false;
    this.sNftBuy = false;
    this.sNftOffer = false;
    this.sNftOfferCancel = false;
  }
};

NotificationSetting.index({ address: 1 }, { unique: true });

mongoose.model("NotificationSetting", NotificationSetting);
