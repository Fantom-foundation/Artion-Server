const router = require("express").Router();
const mongoose = require("mongoose");
const ERC721TOKEN = mongoose.model("ERC721TOKEN");
const ERC721CONTRACT = mongoose.model("ERC721CONTRACT");
const ERC1155CONTRACT = mongoose.model("ERC1155CONTRACT");
const ERC1155TOKEN = mongoose.model("ERC1155TOKEN");
const Collection = mongoose.model("Collection");
const Auction = mongoose.model("Auction");

// list the newly minted 10 tokens
router.get("/getNewestTokens", async (_, res) => {
  let tokens_721 = await ERC721TOKEN.find().sort({ createdAt: 1 }).limit(10);
  let tokens_1155 = await ERC1155TOKEN.find().sort({ createdAt: 1 }).limit(10);
  let tokens = new Array();
  tokens.push(...tokens_721);
  tokens.push(...tokens_1155);
  return res.json({
    status: "success",
    data: tokens,
  });
});

router.get("/getNewestAuctions", async (_, res) => {
  let auctions = await Auction.find().sort({ endTime: 1 }).limit(10);
  if (auctions)
    return res.json({
      status: "success",
      data: auctions,
    });
  else
    return res.json({
      status: "success",
      data: [],
    });
});

router.get("/getCollections", async (_, res) => {
  let collections_721 = await ERC721CONTRACT.find();
  let collections_1155 = await ERC1155CONTRACT.find();

  let all = new Array();
  all.push(...collections_721);
  all.push(...collections_1155);
  let allCollections = await Collection.find({});

  console.log("all collections are ");
  console.log(allCollections);

  let allContracts = new Array();

  for (let i = 0; i < all.length; ++i) {
    let contract = all[i];
    let collection = allCollections.find(
      (col) => col.erc721Address.toLowerCase() == contract.address.toLowerCase()
    );

    if (collection) {
      console.log("collection of address ", contract.address);
      allContracts.push({
        address: collection.erc721Address,
        collectionName: collection.collectionName,
        description: collection.description,
        categories: collection.categories,
        logoImageHash: collection.logoImageHash,
        siteUrl: collection.siteUrl,
        discord: collection.discord,
        twitterHandle: collection.twitterHandle,
        mediumHandle: collection.mediumHandle,
        telegram: collection.telegram,
        isVerified: true,
      });
    } else {
      allContracts.push({
        address: contract.address,
        name: contract.name != "name" ? contract.name : "",
        symbol: contract.symbol != "symbol" ? contract.symbol : "",
        isVerified: false,
      });
    }
  }
  return res.json({
    status: "success",
    data: allContracts,
  });
});

module.exports = router;
