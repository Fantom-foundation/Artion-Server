module.exports = {
  async up(db, client) {
    await db
      .collection("nftitems")
      .updateMany({ liked: null }, { $set: { liked: 0 } });
  },

  async down(db, client) {},
};
