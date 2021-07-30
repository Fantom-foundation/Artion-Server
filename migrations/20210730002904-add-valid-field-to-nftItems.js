module.exports = {
  async up(db, client) {
    await db
      .collection("nftitems")
      .updateMany({ isAppropriate: null }, { $set: { isAppropriate: true } });
  },

  async down(db, client) {},
};
