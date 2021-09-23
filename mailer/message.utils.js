const FantomContacts = require("../constants/contacts");
const SendGridTemplates = require("../constants/mail_template_id");

const createNFTItemMessage = (data) => {
  let message = {
    from: FantomContacts.email,
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
          telegram: FantomContacts.telegram,
          reddit: FantomContacts.reddit,
          artionUnsubscribe: FantomContacts.artionUnsubscribe,
        },
      },
    ],
  };
  return message;
};

const createBundleItemMessage = (data) => {
  let message = {
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
          telegram: FantomContacts.telegram,
          reddit: FantomContacts.reddit,
          artionUnsubscribe: FantomContacts.artionUnsubscribe,
        },
      },
    ],
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

const createNFTItemMessageList = (data) => {
  let message = {
    from: FantomContacts.email,
    templateId: SendGridTemplates.nftitem,
    personalizations: [
      {
        to: data.to,
        bcc: data.bcc,
        dynamic_template_data: {
          title: data.title,
          content: data.content,
          image: data.image,
          name: data.name,
          link: data.link,
          discord: FantomContacts.discord,
          twitter: FantomContacts.twitter,
          telegram: FantomContacts.telegram,
          reddit: FantomContacts.reddit,
          artionUnsubscribe: FantomContacts.artionUnsubscribe,
        },
      },
    ],
  };
  return message;
};

const createBundleItemMessageList = (data) => {
  let message = {
    from: FantomContacts.email,
    templateId: SendGridTemplates.bundleitem,
    personalizations: [
      {
        to: data.to,
        bcc: data.bcc,
        dynamic_template_data: {
          title: data.title,
          content: data.content,
          link: data.link,
          discord: FantomContacts.discord,
          twitter: FantomContacts.twitter,
          telegram: FantomContacts.telegram,
          reddit: FantomContacts.reddit,
          artionUnsubscribe: FantomContacts.artionUnsubscribe,
        },
      },
    ],
  };
  return message;
};

const messageUtils = {
  createNFTItemMessage,
  createBundleItemMessage,
  createNewCollectionApplicationMessage,
  createApplicationApprovedMessage,
  createApplicationDeniedMessage,
  createEmailList,
  createNFTItemMessageList,
  createBundleItemMessageList,
};

module.exports = messageUtils;
