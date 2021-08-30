require("dotenv").config();
const FantomContacts = {
  discord: "http://chat.fantom.network/",
  twitter: "https://twitter.com/FantomFDN",
  instagram: "https://www.instagram.com/fantomfoundation2020/",
  telegram: "https://t.me/fantom_korean",
  reddit: "https://reddit.com/r/FantomFoundation",
  artionUnsubscribe: `https://${
    process.env.RUNTIME ? "testnet." : ""
  }artion.io/settings/notification`,
  email: "support.artion@fantom.foundation",
};

module.exports = FantomContacts;
