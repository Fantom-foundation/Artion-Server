module.exports = {
  async up(db, client) {
    await db
      .collection("collections")
      .updateMany({}, { $set: { feeRecipient: "", royalty: 0 } });
  },

  async down(db, client) {},
};
