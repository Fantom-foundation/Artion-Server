require("dotenv").config();
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const app_url = process.env.APP_URL;

const createMessage = (data) => {
  let message = {};
  let event = data.event;
  switch (event) {
    case "ItemSold":
      {
        if (data.isBuyer) {
          // create data for dynamic email spread out
          let to = [data.to];
          let title = "Bundle Purchased!";
          let content = `Congratulations! You have purchased a new bundle ${data.bundleName}.`;
          let link = `${app_url}bundle/${data.bundleID}`;

          message = messageUtils.createBundleItemMessage({
            to,
            title,
            content,
            link,
          });
        } else {
          // create data for dynamic email spread out
          let to = [data.to];
          let title = "Bundle Sold!";
          let content = `Congratulations! You have sold your bundle ${data.bundleName}.`;
          let link = `${app_url}bundle/${data.bundleID}`;

          message = messageUtils.createBundleItemMessage({
            to,
            title,
            content,
            link,
          });
        }
      }
      break;
    case "OfferCreated":
      {
        // create data for dynamic email spread out
        let to = [data.to];
        let title = "Offer created to your bundle!";
        let content = `Congratulations! You have received an offer to your bundle ${data.bundleName}.`;
        let link = `${app_url}bundle/${data.bundleID}`;

        message = messageUtils.createBundleItemMessage({
          to,
          title,
          content,
          link,
        });
      }
      break;
    case "OfferCanceled":
      {
        // create data for dynamic email spread out
        let to = [data.to];
        let title = "An offer to your bundle canceled";
        let content = `An offer to your bundle ${data.bundleName} is now canceled.`;
        let link = `${app_url}bundle/${data.bundleID}`;

        message = messageUtils.createBundleItemMessage({
          to,
          title,
          content,
          link,
        });
      }
      break;
  }

  return message;
};

const sendEmail = (data) => {
  let message = createMessage(data);
  sgMail.sendMultiple(message, (error, result) => {
    if (error) {
      console.log(error);
    } else {
      console.log("That's was it!");
    }
  });
};

module.exports = sendEmail;
