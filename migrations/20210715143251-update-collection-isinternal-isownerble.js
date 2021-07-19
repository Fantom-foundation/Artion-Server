module.exports = {
  async up(db, client) {
    await db.collection("collections").updateMany(
      {
        isInternal: null,
      },
      { $set: { isInternal: false } }
    );
    await db.collection("collections").updateMany(
      {
        isOwnerble: null,
      },
      { $set: { isOwnerble: false } }
    );
  },

  async down(db, client) {},
};
