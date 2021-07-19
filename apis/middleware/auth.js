require("dotenv").config();
const jwt = require("jsonwebtoken");
const jwt_secret = process.env.JWT_SECRET;

const auth = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token == null)
      return res.status(401).json({
        status: "failed",
        data: "auth token not provided",
      });
    jwt.verify(token, jwt_secret, (err) => {
      if (err)
        return res.status(400).json({
          status: "failed",
          data: "auth token expired",
        });
      next();
    });
  } catch (error) {
    return res.status(400).json({
      status: "failed",
      data: "auth token expired",
    });
  }
};
module.exports = auth;
