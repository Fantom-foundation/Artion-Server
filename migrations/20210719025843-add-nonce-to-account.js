module.exports = {
  async up(db, client) {
    await db.collection("accounts").updateMany(
      {
        nonce: null,
      },
      { $set: { nonce: 0 } }
    );
  },

  async down(db, client) {},
};
