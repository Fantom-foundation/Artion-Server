module.exports = {
  async up(db, client) {
    await db.collection("NFTITEM").updateMany({}, { $set: { liked: 0 } });
  },

  async down(db, client) {},
};
