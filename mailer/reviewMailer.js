require("dotenv").config();
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const foundationEmail = "support.artion@fantom.foundation";

const adminEmails = ["artion@fantom.foundation"];

const createDenyMessage = (data) => {
  return {
    to: data.to,
    from: foundationEmail,
    subject: data.subject,
    text: "artion notification",
    html: `Your collection has been denied to register on Artion. <br/><br/> reason : ${data.reason} </br></br> Thank You.  <br/><br/>`,
  };
};

const createApproveMessage = (data) => {
  return {
    to: data.to,
    from: foundationEmail,
    subject: data.subject,
    text: "artion notification",
    html: "Dear Artion User! <br/> Your collection has been successfully registered in Artion. ",
  };
};

const sendApplicationDenyEmail = (data) => {
  let message = createDenyMessage(data);
  sgMail.sendMultiple(message).then(
    () => {},
    (error) => {
      if (error.response) {
      }
    }
  );
};

const sendApplicationReviewedEmail = (data) => {
  let message = createApproveMessage(data);
  sgMail.sendMultiple(message).then(
    () => {},
    (error) => {
      if (error.response) {
      }
    }
  );
};

const notifyAdminForNewCollectionApplication = () => {
  let message = {
    to: adminEmails,
    from: foundationEmail,
    subject: "New Application",
    text: "artion notification",
    html: "New collection has been submitted for your review.",
  };
  sgMail.sendMultiple(message).then(
    () => {},
    (error) => {
      if (error.response) {
      }
    }
  );
};

const notifyInternalCollectionDeployment = (address, email) => {
  let message = {
    to: email,
    from: foundationEmail,
    subject: "Collection Created",
    text: "artion notification",
    html: `New collection has been deployed with address ${address}`,
  };
  sgMail.send(message).then(
    () => {},
    (error) => {
      if (error.response) {
        console.error(error.response.body);
      }
    }
  );
};

const applicationMailer = {
  sendApplicationDenyEmail,
  sendApplicationReviewedEmail,
  notifyAdminForNewCollectionApplication,
  notifyInternalCollectionDeployment,
};

module.exports = applicationMailer;
