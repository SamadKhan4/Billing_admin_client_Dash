const Notification = require("../Models/Notification");

const sendNotification = async ({ userId, message, type = "custom", link = "", data = {} }) => {
  try {
    const notification = new Notification({ userId, message, type, link, data });
    await notification.save();
  } catch (err) {
    console.error("❌ Error sending notification:", err.message);
  }
};

module.exports = sendNotification;
