module.exports = {
  async up(db, client) {
    await db
      .collection("bundles")
      .updateMany({}, { $set: { liked: 0, default: 0 } });
  },

  async down(db, client) {},
};
