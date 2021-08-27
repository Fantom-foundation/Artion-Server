const SendGridTemplates = require("../constants/mail_template_id");
const foundationEmail = "support.artion@fantom.foundation";

const createNFTItemMessage = (data) => {
  let message = {
    from: {
      email: foundationEmail,
      personalizations: [
        {
          to: data.to,
          dynamic_template_data: {
            title: data.title,
            content: data.content,
            image: data.image,
            name: data.name,
            link: data.link,
          },
        },
      ],
      template_id: SendGridTemplates.nftitem,
    },
  };
  return message;
};

const createBundleItemMessage = (data) => {
  let message = {
    from: {
      email: foundationEmail,
      personalizations: [
        {
          to: data.to,
          dynamic_template_data: {
            title: data.title,
            content: data.content,
            link: data.link,
          },
        },
      ],
      template_id: SendGridTemplates.bundleitem,
    },
  };
  return message;
};

const createNewCollectionApplicationMessage = () => {};

const createApplicationApprovedMessage = () => {};

const createApplicationDeniedMessage = () => {};

const createEmailList = (emails) => {
  let to = [];
  emails.map((email) => {
    to.push({ email: email });
  });
  return to;
};

const messageUtils = {
  createNFTItemMessage,
  createBundleItemMessage,
  createNewCollectionApplicationMessage,
  createApplicationApprovedMessage,
  createApplicationDeniedMessage,
  createEmailList,
};

module.exports = messageUtils;
