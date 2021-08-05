module.exports = {
  async up(db, client) {
    // update nftitems collection
    await db.collection("nftitems").updateMany(
      {},
      {
        $set: {
          isFiltered: false,
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
