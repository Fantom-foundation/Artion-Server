module.exports = {
  async up(db, client) {
    await db
      .collection("nftitems")
      .updateMany({ contentType: null }, { $set: { contentType: "image" } });
  },

  async down(db, client) {},
};
