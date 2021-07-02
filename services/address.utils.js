require("dotenv").config();
const jwt = require("jsonwebtoken");
const jwt_secret = process.env.JWT_SECRET;
const toLowerCase = require("../utils/utils");

const extractAddress = (req, res) => {
  let authorization = req.headers.authorization.split(" ")[1],
    decoded;
  try {
    decoded = jwt.verify(authorization, jwt_secret);
  } catch (e) {
    return res.status(401).send("unauthorized");
  }
  let address = decoded.data;
  address = toLowerCase(address);
  return address;
};

module.exports = extractAddress;
