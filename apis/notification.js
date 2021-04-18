const router = require("express").Router();
const auth = require("./middleware/auth");
const mongoose = require("mongoose");

const Notification = mongoose.model("Notification");

router.post("/getnotifications", auth, async (req, res) => {
  try {
    let address = req.body.address;
    let notifications = await Notification.find({ address: address });
    return res.json({
      status: "success",
      data: notifications,
    });
  } catch (error) {
    return res.status(400).json({
      status: "failed",
    });
  }
});

router.post("/emptynotifications", auth, async (req, res) => {
  try {
    let address = req.body.address;
    await Notification.delete({ address: address });
    return res.json({
      status: "success",
    });
  } catch (error) {
    return res.status(400).json({
      status: "failed",
    });
  }
});

router.post("/addnotification", auth, async (req, res) => {
  try {
    let address = req.body.address;
    let content = req.body.content;
    let notification = await Notification.find({ address: address });
    if (notification) {
      let contents = notification.contents;
      contents = contents.push(content);
      notification.contents = contents;
      let _notification = await notification.save();
      return res.json({
        status: "success",
        data: _notification,
      });
    }
    return res.json({
      status: "success",
      data: notification,
    });
  } catch (error) {
    return res.status(400).json({
      status: "failed",
    });
  }
});

module.exports = router;
