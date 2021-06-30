require("dotenv").config();
const requestIP = require("request-ip");

const tracker_ip = process.env.TRACKER_IP;

const service_auth = (req, res, next) => {
  next();
  return;
  let request_ip = requestIP.getClientIp(req);
  if (request_ip == tracker_ip) {
    console.log("correct ip");
    next();
  } else console.log("invalid ip");
  return res.status(400).json({
    status: "failed",
    data: "you are not supposed to call this api endpoint",
  });
};

module.exports = service_auth;
