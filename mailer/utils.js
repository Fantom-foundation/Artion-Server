const mongoose = require("mongoose");
const Collection = mongoose.model("Collection");
const ERC721CONTRACT = mongoose.model("ERC721CONTRACT");
const toLowerCase = require("../utils/utils");

const getCollectionName = async (address) => {
  try {
    let collection = await Collection.findOne({
      erc721Address: toLowerCase(address),
    });
    if (collection) return collection.collectionName;
    else {
      let erc721contract = await ERC721CONTRACT.findOne({ address: address });
      if (erc721contract) return erc721contract.name;
      else return address;
    }
  } catch (error) {
    return address;
  }
};

module.exports = getCollectionName;
