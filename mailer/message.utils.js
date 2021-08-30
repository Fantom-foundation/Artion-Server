const FantomContacts = require("../constants/contacts");
const SendGridTemplates = require("../constants/mail_template_id");
const foundationEmail = "support.artion@fantom.foundation";

const createNFTItemMessage = (data) => {
  let message = {
    from: {
      from: foundationEmail,
      templateId: SendGridTemplates.nftitem,
      personalizations: [
        {
          to: data.to,
          dynamic_template_data: {
            title: data.title,
            content: data.content,
            image: data.image,
            name: data.name,
            link: data.link,
            discord: FantomContacts.discord,
            twitter: FantomContacts.twitter,
            instagram: FantomContacts.instagram,
            telegram: FantomContacts.telegram,
            reddit: FantomContacts.reddit,
            artionUnsubscribe: FantomContacts.artionUnsubscribe,
          },
        },
      ],
    },
  };
  return message;
};

const createBundleItemMessage = (data) => {
  let message = {
    from: {
      from: FantomContacts.email,
      templateId: SendGridTemplates.bundleitem,
      personalizations: [
        {
          to: data.to,
          dynamic_template_data: {
            title: data.title,
            content: data.content,
            link: data.link,
            discord: FantomContacts.discord,
            twitter: FantomContacts.twitter,
            instagram: FantomContacts.instagram,
            telegram: FantomContacts.telegram,
            reddit: FantomContacts.reddit,
            artionUnsubscribe: FantomContacts.artionUnsubscribe,
          },
        },
      ],
    },
  };
  return message;
};

const createNewCollectionApplicationMessage = () => {};

const createApplicationApprovedMessage = () => {};

const createApplicationDeniedMessage = () => {};

const createEmailList = (emails) => {
  let to = [];
  try {
    emails.map((email) => {
      to.push(email);
    });
    return to;
  } catch (error) {
    return [emails];
  }
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
