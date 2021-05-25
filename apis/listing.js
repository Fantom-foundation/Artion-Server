const router = require("express").Router();
const auth = require("./middleware/auth");
const mongoose = require("mongoose");

const Listing = mongoose.model("Listing");

const toLowerCase = require("../utils/utils");

router.post("/getListings", auth, async (req, res) => {
  00

  
  try {
    let owner = req.body.address;
    owner = toLowerCase(address);
    let listings = await Listing.find({ owner: owner });
    return res.json({
      status: "success",
      data: listings,
    });
  } catch (error) {
    return res.status(400).json({
      status: "failed",
    });
  }
});

router.post("", auth, async (req, res) => {});
module.exports = router;
