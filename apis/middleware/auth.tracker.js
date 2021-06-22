require("dotenv").config();
const requestIP = require("request-ip");

const tracker_ip_1 = process.env.TRACKER_IP_1;
const tracker_ip_2 = process.env.TRACKER_IP_2;

const service_auth = (req, res, next) => {
  let request_ip = requestIP.getClientIp(req);
  if (request_ip == tracker_ip_1 || request_ip == tracker_ip_2) next();
  else
    return res.status(400).json({
      status: "failed",
      data: "you are not supposed to call this api endpoint",
    });
};

module.exports = service_auth;
