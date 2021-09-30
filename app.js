const express = require("express");
const app = express();
require("dotenv").config();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const port = 5001;

const Logger = require('./services/logger');
const morganMiddleware = require('./apis/middleware/morgan');

app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

require("./models/abi");
require("./models/account");
require("./models/bid");
require("./models/category");
require("./models/collection");
require("./models/erc721contract");
require("./models/erc721token");
require("./models/erc1155contract");
require("./models/erc1155token");
require("./models/nftitems");
require("./models/event");
require("./models/highestblock");
require("./models/listing");
require("./models/notification");
require("./models/offer");
require("./models/tradehistory");
require("./models/auction");
require("./models/erc1155holding");
require("./models/banneduser");
require("./models/bannenft");
require("./models/bundle");
require("./models/bundleauction");
require("./models/bundlebid");
require("./models/bundleinfo");
require("./models/bundlelisting");
require("./models/bundleoffer");
require("./models/bundleHistory");
require("./models/follow");
require("./models/like");
require("./models/bundlelike");
require("./models/factorycollection");
require("./models/notificationsetting");
require("./models/moderator");
require("./models/turkwork");
require("./models/sitelock");
require("./models/paytoken");
require("./models/unlockable");

app.use(bodyParser.json());
app.use(express.json());
app.use(
  cors()
);
app.options("*", cors()); // include before other routes

app.use(morganMiddleware);
app.use(require("./apis"));

const priceFeed = require("./services/price.feed");

const connect = () => {
  const uri = process.env.DB_URL;

  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "connection error:"));
  db.once("open", function () {
    Logger.info("artion server has been connected to the db server");
    Logger.info("price feed has been started");
    priceFeed.runPriceFeed();
    app.listen(port, () => {
      Logger.info(`artion server is running at port ${port}`);
    });
  });
};

connect();
