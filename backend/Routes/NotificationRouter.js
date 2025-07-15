const express = require("express");
const router = express.Router();
const NotificationController = require("../Controllers/NotificationController");
const { isLoggedIn } = require("../Middlewares/AuthMiddleware");

router.get("/notifications", isLoggedIn, NotificationController.getMyNotifications);
router.put("/notifications/:id/read", isLoggedIn, NotificationController.markAsRead);

module.exports = router;
