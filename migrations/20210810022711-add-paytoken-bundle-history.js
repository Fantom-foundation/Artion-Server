module.exports = {
  async up(db, client) {
    // update bundle trade history
    await db
      .collection("bundletradeHistories")
      .updateMany({}, { $set: { paymentToken: "ftm", priceInUSD: 0 } });
  },

  async down(db, client) {},
};
