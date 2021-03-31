require("dotenv").config();
const jwt = require("jsonwebtoken");
const jwt_secret = process.env.JWT_SECRET;
const router = require("express").Router();

router.post("/getToken", (req, res) => {
  let address = req.body.address;
  let token = jwt.sign(
    {
      data: address,
    },
    jwt_secret,
    { expiresIn: "1h" }
  );
  return res.json({
    status: "success",
    token: token,
  });
});

module.exports = router;
