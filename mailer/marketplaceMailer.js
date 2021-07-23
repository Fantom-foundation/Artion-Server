require("dotenv").config();
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const app_url = process.env.APP_URL;
const foundationEmail = "support.artion@fantom.foundation";

const createMessage = (data) => {
  let message = {};
  let event = data.event;
  const artionUri = `${app_url}${data.nftAddress}/${data.tokenID}`;
  switch (event) {
    case "ItemSold":
      {
        if (data.isBuyer) {
          message = {
            to: data.to,
            from: foundationEmail,
            subject: data.subject,
            text: "artion notification",
            html: `<p>Dear ${data.alias}<p/> You have bought a new NFT item, ${data.collectionName}'s ${data.tokenName} at ${data.price} FTM. <br/> For more information, click <a href = "${artionUri}">here</a></br><br/></br><br/>  `,
          };
        } else {
          message = {
            to: data.to,
            from: foundationEmail,
            subject: data.subject,
            text: "artion notification",
            html: `<p>Dear ${data.alias}<p/> You have sold a new NFT item, ${data.collectionName}'s ${data.tokenName} at ${data.price} FTM. <br/> For more information, click <a href = "${artionUri}">here</a></br><br/></br><br/>  `,
          };
        }
      }
      break;
    case "OfferCreated":
      {
        if (data.type == 721) {
          message = {
            to: data.to,
            from: foundationEmail,
            subject: data.subject,
            text: "artion notification",
            html: `<p>Dear ${data.alias}!</p> You have received an offer from ${data.from} for your item ${data.tokenID} of ${data.collectionName} collection at ${data.price} wFTM. <br/> For more information, click <a href = "${artionUri}">here</a></br><br/></br><br/>  `,
          };
        } else {
        }
      }
      break;
    case "OfferCanceled":
      {
        if (data.type == 721) {
          message = {
            to: data.to,
            from: foundationEmail,
            subject: data.subject,
            text: "artion notification",
            html: `<p>Dear ${data.alias}!</p> An Offer from ${data.from} for your item ${data.tokenID} of ${data.collectionName} collection has been withdrawn. <br/> For more information, click <a href = "${artionUri}">here</a></br><br/></br><br/>  `,
          };
        } else {
        }
      }
      break;
  }

  return message;
};

const sendEmailMarketplace = (data) => {
  let message = createMessage(data);
  sgMail.send(message).then(
    () => {},
    (error) => {
      if (error.response) {
        console.error(error.response.body);
      }
    }
  );
};

module.exports = sendEmailMarketplace;
