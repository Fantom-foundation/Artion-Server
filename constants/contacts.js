require("dotenv").config();
const FantomContacts = {
  discord: "http://chat.fantom.network/",
  twitter: "https://twitter.com/FantomFDN",
  telegram: "https://t.me/fantomfoundation",
  reddit: "https://reddit.com/r/FantomFoundation",
  artionUnsubscribe: `https://${
    process.env.RUNTIME ? "testnet." : ""
  }artion.io/settings/notification`,
  email: "support.artion@fantom.foundation",
};

module.exports = FantomContacts;
