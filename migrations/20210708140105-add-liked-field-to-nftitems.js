module.exports = {
  async up(db, client) {
    await db.collection("NFTITEM").updateMany({}, { $set: { liked: 0 } });
  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  },
};
