module.exports = {
  async up(db, client) {
    // add to 721 contracts
    await db
      .collection("erc721contracts")
      .updateMany({ isAppropriate: null }, { $set: { isAppropriate: true } });
    // add to 1155 contracts
    await db
      .collection("erc1155contracts")
      .updateMany({ isAppropriate: null }, { $set: { isAppropriate: true } });
    // add to collections
    await db
      .collection("collections")
      .updateMany({ isAppropriate: null }, { $set: { isAppropriate: true } });
  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  },
};
