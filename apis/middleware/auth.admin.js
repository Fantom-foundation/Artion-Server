require("dotenv").config();
const extractAddress = require("../../services/address.utils");
const AdminAddresses = require("../../config/adminAddress");

const admin_auth = (req, res, next) => {
  try {
    let address = extractAddress(req, res);
    if (AdminAddresses.includes(address)) {
      next();
    } else
      return res.status(400).json({
        status: "failed",
        data: "only admins are allowed for this api",
      });
  } catch (error) {
    return res.json({
      status: "failed",
    });
  }
};

module.exports = admin_auth;
