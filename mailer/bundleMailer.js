require("dotenv").config();
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const app_url = process.env.APP_URL;
const foundationEmail = "support.artion@fantom.foundation";

const createMessage = (data) => {
  let message = {};
  let event = data.event;
  const artionUri = `${app_url}bundle/${data.bundleID}`;
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
            html: `<p>Dear ${data.alias}<p/> You have sold a new NFT Bundle, ${data.bundleName} at ${data.price} FTM. <br/> For more information, click <a href = "${artionUri}">here</a></br><br/></br><br/>  ${team}`,
          };
        }
      }
      break;
    case "OfferCreated":
      message = {
        to: data.to,
        from: foundationEmail,
        subject: "You received an offer for your bundle!",
        text: "artion notification",
        html: `<p>Dear ${data.alias}!</p> You have received an offer from ${data.from} for your bundle ${data.bundleName} at ${data.price} wFTM. <br/> For more information, click <a href = "${artionUri}">here</a></br><br/></br><br/>  ${team}`,
      };
      break;
    case "OfferCanceled":
      {
        message = {
          to: data.to,
          from: foundationEmail,
          subject: "Offer withdrawn!",
          text: "artion notification",
          html: `<p>Dear ${data.alias}!</p> An Offer from ${data.from} for your bundle ${data.bundleName} has been withdrawn. <br/> For more information, click <a href = "${artionUri}">here</a></br><br/></br><br/>  ${team}`,
        };
      }
      break;
  }

  return message;
};

const sendEmail = (data) => {
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

module.exports = sendEmail;
