const router = require("express").Router();

router.post("/test", async (req, res) => {
  const requestIP = require("request-ip");
  let ip = requestIP.getClientIp(req);
  console.log(ip);
  return res.json({});
});

module.exports = router;
