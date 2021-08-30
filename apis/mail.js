const router = require("express").Router();
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const SendGridTemplates = require("../constants/mail_template_id");
router.get("/mailTest", async (req, res) => {
  try {
    let msg = {
      from: "jason.kwon@fantom.foundation",
      templateId: SendGridTemplates.nftitem,
      personalizations: [
        {
          to: [
            "fortune.onchain@gmail.com",
            "jason.k0427@gmail.com",
            "danxin.ni0119@gmail.com",
            "mk@fantom.foundation",
          ],
          dynamic_template_data: {
            title: "Jason Test",
            content:
              "I am testing email template please let me know if you like this.",
            image: "https://storage.artion.io/image/1629994367734.png",
            name: "From Ethereum to Fantom",
            link: "https://artion.io/explore/0x7f6a67065fa3d2e42383a27f1a7537c2ab88318b/4",
          },
          // dynamic_template_data: {
          //   title: "Jason Test",
          //   content:
          //     "I am testing email template please let me know if you like this.",
          //   // image: "https://storage.artion.io/image/1629994367734.png",
          //   // name: "From Ethereum to Fantom",
          //   link: "https://artion.io/explore/0x7f6a67065fa3d2e42383a27f1a7537c2ab88318b/4",
          // },
        },
      ],
    };
    //send the email
    sgMail.send(msg, (error, result) => {
      if (error) {
        console.log(error);
        return res.json({ status: "failed" });
      } else {
        console.log("That's wassup!");
        return res.json({ status: "success" });
      }
    });
  } catch (error) {
    console.log(error);
    return res.json({ status: "failed" });
  }
});

module.exports = router;
