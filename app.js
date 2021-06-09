const express = require("express");
const app = express();
require("dotenv").config();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const port = 5001;

app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

require("./models//abi");
require("./models/account");
require("./models/bid");
require("./models/bundle");
require("./models/category");
require("./models/collection");
require("./models/erc721contract");
require("./models/erc721token");
require("./models/erc1155contract");
require("./models/erc1155token");
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

app.use(bodyParser.json());
app.options("*", cors()); // include before other routes
app.use(cors());
app.use(require("./apis"));

const connect = () => {
  const uri = process.env.DB_URL;

  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "connection error:"));
  db.once("open", function () {
    console.log("nifty server has been connected to the db server");
    app.listen(port, () => {
      console.log(`nifty server is running at port ${port}`);
    });
  });
};

connect();
