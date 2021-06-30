require("dotenv").config();
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const foundationEmail = "support.artion@fantom.foundation";

const createMessage = (data) => {
  let message = {};
  let event = data.event;
  const artionUri = `https://artion.io/bundle/${data.bundleID}`;
  const team = "Artion team from Fantom Foundation";
  switch (event) {
    case "ItemSold":
      {
        if (data.isBuyer) {
          message = {
            to: data.to,
            from: foundationEmail,
            subject: "You purchased a new bundle!",
            text: "artion notification",
            html: `<p>Dear ${data.alias}<p/> You have bought a new NFT Bundle, ${data.bundleName} at ${data.price} FTM. <br/> For more information, click <a href = "${artionUri}">here</a></br><br/></br><br/>  ${team}`,
          };
        } else {
          message = {
            to: data.to,
            from: foundationEmail,
            subject: "You sold out your bundle!",
            text: "artion notification",
            html: `<p>Dear ${data.alias}<p/> You have sold a new NFT item, ${data.bundleName} at ${data.price} FTM. <br/> For more information, click <a href = "${artionUri}">here</a></br><br/></br><br/>  ${team}`,
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
            html: `<p>Dear ${data.alias}!</p> You have received an offer from ${data.from} for your item ${data.tokenID} of ${data.collectionName} collection at ${data.price} wFTM. <br/> For more information, click <a href = "${artionUri}">here</a></br><br/></br><br/>  ${team}`,
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
            html: `<p>Dear ${data.alias}!</p> An Offer from ${data.from} for your item ${data.tokenID} of ${data.collectionName} collection has been withdrawn. <br/> For more information, click <a href = "${artionUri}">here</a></br><br/></br><br/>  ${team}`,
          };
        } else {
        }
      }
      break;
  }

  return message;
};

const sendEmail = (data) => {
  let message = createMessage(data);
  sgMail.send(message).then(
    () => {
      console.log("email sent");
    },
    (error) => {
      console.log("failed to send an email");
      console.error(error);

      if (error.response) {
        console.error(error.response.body);
      }
    }
  );
};

module.exports = sendEmail;
