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

require("./models/account");
require("./models/bundle");
require("./models/event");
require("./models/erc721token");
require("./models/erc721contract");
require("./models/tradehistory");
require("./models/collection");
require("./models/transferhistory");
require("./models/abi");
require("./models/listing");
require("./models/notification");
require("./models/bid");
require("./models/highestblock");
require("./models/offer");
require("./models/erc1155contract");
require("./models/erc1155token");

app.use(bodyParser.json());
app.options("*", cors()); // include before other routes
app.use(cors());
app.use(require("./apis"));

const connect = () => {
  const db_pwd = process.env.MONGODB_ATLAS_PASSWORD;
  const db_name = process.env.DB_NAME;
  const uri = `mongodb://localhost:27017/FantomMarketPlace`;

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
