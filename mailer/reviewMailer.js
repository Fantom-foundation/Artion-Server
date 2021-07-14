require("dotenv").config();
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const foundationEmail = "support.artion@fantom.foundation";
const team = "Artion team from Fantom Foundation";

const sendApplicationDenyEmail = (data) => {
  return {
    to: data.to,
    from: foundationEmail,
    subject: data.subject,
    text: "artion notification",
    html: `Your collection has been denied to register on Artion. <br/></br> reason : ${data.reason} </br></br> Thank You.  <br/><br/>${team}`,
  };
};

const createApproveMessage = (data) => {
  return {
    to: data.to,
    from: foundationEmail,
    subject: data.subject,
    text: "artion notification",
    html: data.message,
  };
};

const sendApplicationDenyEmail = (data) => {
  let message = createDenyMessage(data);
  sgMail.send(message).then(
    () => {},
    (error) => {
      if (error.response) {
      }
    }
  );
};

const sendApplicationReviewedEmail = (data) => {
  let message = createApproveMessage(data);
  sgMail.send(message).then(
    () => {},
    (error) => {
      if (error.response) {
      }
    }
  );
};

const notifyAdminForNewCollectionApplication = () => {
  let message = {
    to: "fortune.onchain@gmail.com",
    from: foundationEmail,
    subject: data.subject,
    text: "artion notification",
    html: data.message,
  };
  sgMail.send(message).then(
    () => {},
    (error) => {
      if (error.response) {
      }
    }
  );
};

const applicationMailer = {
  sendApplicationDenyEmail,
  sendApplicationReviewedEmail,
  notifyAdminForNewCollectionApplication,
};

module.exports = applicationMailer;
