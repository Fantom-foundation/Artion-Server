const router = require("express").Router();
const axios = require("axios");

router.get("/mailTest", async (req, res) => {
  try {
    let templateID = "";
    let sgKey = process.env.SENDGRID_API_KEY;
    let data = {
      from: "jason.kwon@fantom.foundation",
      personalizations: [
        {
          to: [{ email: "fortune.onchain@gmail.com" }],
          dynamic_template_data: {
            name: "jason k testing dynamic email",
          },
        },
      ],
      template_id: templateID,
    };
    data = JSON.stringify(data);
    await axios.post("https://api.sendgrid.com/v3/mail/send", data, {
      headers: {
        Authorization: `Bearer ${sgKey}`,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.log(error);
    return res.json({ status: "failed" });
  }
});

module.exports = router;
