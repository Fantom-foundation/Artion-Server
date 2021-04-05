require("dotenv").config();
const EmailValidation = require("emailvalid");
const nodemailer = require("nodemailer");

const ev = new EmailValidation({ allowFreemail: false });

sendEmail = async (to, subject, content) => {
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PWD,
    },
  });
  transporter.sendMail({
    from: process.env.MAIL_USER,
    to: to,
    subject: subject,
    text: content,
    html: "",
  });
};

validateEmail = (email) => {
  let isValid = ev.check(email);
  console.log(isValid);
  return isValid;
};

const MailService = {
  sendEmail,
  validateEmail,
};

module.exports = MailService;
