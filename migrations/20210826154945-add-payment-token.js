module.exports = {
  async up(db, client) {
    await db.collection("nftitems").updateMany(
      { paymentToken: null },
      {
        $set: {
          paymentToken: "ftm",
          lastSalePricePaymentToken: "ftm",
          lastSalePriceInUSD: 0,
          priceInUSD: 0,
        },
      }
    );
  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  },
};
