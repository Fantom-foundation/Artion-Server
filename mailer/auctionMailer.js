require("dotenv").config();
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const createMessage = (data) => {
  let message = {};
  let event = data.event;
  const artionUri = `https://artion.io/${data.nftAddress}/${data.tokenID}`;
  const team = "Artion team from Fantom Foundation";
  if (data.type == "auction") {
    switch (event) {
      case "UpdateAuctionReservePrice":
        {
          message = {
            to: data.to,
            from: "support.artion@fantom.foundation",
            subject: data.subject,
            text: "artion notification",
            html: `<p>Dear ${data.alias}<p/> Your bid, from ${data.collectionName}'s ${data.tokenName} has updated it's reserve price to ${data.newPrice} <br/> For more information, click <a href = "${artionUri}">here</a></br><br/></br><br/>  ${team}`,
          };
        }
        break;
      case "BidPlaced":
        {
          message = {
            to: data.to,
            from: "support.artion@fantom.foundation",
            subject: data.subject,
            text: "artion notification",
            html: `<p>Dear ${data.alias}<p/> Your item, from ${data.collectionName}'s ${data.tokenName} has has got a bid from ${data.bidderAlias} at the price of ${data.bid} FTMs <br/> For more information, click <a href = "${artionUri}">here</a></br> ${team}`,
          };
        }
        break;
      case "BidWithdrawn":
        {
          message = {
            to: data.to,
            from: "support.artion@fantom.foundation",
            subject: data.subject,
            text: "artion notification",
            html: `<p>Dear ${data.alias}<p/> Your item, from ${data.collectionName}'s ${data.tokenName} has has got a bid withdrawn  from ${data.bidderAlias} at the price of ${data.bid} FTMs <br/> For more information, click <a href = "${artionUri}">here</a></br> ${team}`,
          };
        }
        break;
      case "AuctionResulted":
        {
          message = {
            to: data.to,
            from: "support.artion@fantom.foundation",
            subject: data.subject,
            text: "artion notification",
            html: `<p>Dear ${data.alias}<p/> You won the item, ${data.collectionName}'s ${data.tokenName} as it's auction has been resulted.<br/> For more information, click <a href = "${artionUri}">here</a></br> ${team}`,
          };
        }
        break;
      case "AuctionCancelled":
        {
          message = {
            to: data.to,
            from: "support.artion@fantom.foundation",
            subject: data.subject,
            text: "artion notification",
            html: `<p>Dear ${data.alias}<p/> The NFT Item, from ${data.collectionName}'s ${data.tokenName} is dropped from auction<br/> For more information, click <a href = "${artionUri}">here</a></br> ${team}`,
          };
        }
        break;
    }
  } else {
    //for marketplace
  } //for marketplace

  return message;
};

const sendEmailAuction = (data) => {
  let message = createMessage(data);
  sgMail.send(message).then(
    () => {},
    (error) => {
      if (error.response) {
      }
    }
  );
};

module.exports = sendEmailAuction;
