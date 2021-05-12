const router = require("express").Router();
const Web3 = require("web3");
const validator = require("../utils/index");

const toLowerCase = require("../utils/utils");

const web3 = new Web3(
  new Web3.providers.HttpProvider("https://rpcapi.fantom.network")
);
let erc721validator = new validator.ERC721Validator(web3);
let token = "1";

router.post("/isERC721Contract", async (req, res) => {
  let address = req.body.address;
  address = toLowerCase(address);
  try {
    let isValid = await erc721validator.token(1, address, token);
    if (isValid == true)
      return res.json({
        status: "success",
        data: true,
      });
    else {
      res.status(400).json({
        status: "failed",
        data: false,
      });
    }
  } catch (error) {
    res.status(400).json({
      status: "failed",
      data: false,
    });
  }
});

module.exports = router;
