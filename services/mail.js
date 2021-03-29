require("dotenv").config();
const nodemailer = require("nodemailer");

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

const MailService = {
  sendEmail,
};

module.exports = MailService;
