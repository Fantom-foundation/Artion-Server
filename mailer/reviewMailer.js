require("dotenv").config();
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const foundationEmail = "support.artion@fantom.foundation";
const team = "Artion team from Fantom Foundation";

const adminEmails = ["fortune.onchain@gmail.com"];

const createDenyMessage = (data) => {
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
    html: "Dear Artion User! <br/> Your collection has been successfully registered in Artion. <br/><br/> Artion Team",
  };
};

const sendApplicationDenyEmail = (data) => {
  let message = createDenyMessage(data);
  sgMail.sendMultiple(message).then(
    () => {
      console.log("email sent");
    },
    (error) => {
      if (error.response) {
        console.log(error);
      }
    }
  );
};

const sendApplicationReviewedEmail = (data) => {
  let message = createApproveMessage(data);
  sgMail.sendMultiple(message).then(
    () => {
      console.log("email sent");
    },
    (error) => {
      if (error.response) {
        console.log(error);
      }
    }
  );
};

const notifyAdminForNewCollectionApplication = () => {
  let message = {
    to: adminEmails,
    from: foundationEmail,
    subject: data.subject,
    text: "artion notification",
    html: "New collection has been submitted for your review.",
  };
  sgMail.sendMultiple(message).then(
    () => {
      console.log("email sent");
    },
    (error) => {
      if (error.response) {
        console.log(error);
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
