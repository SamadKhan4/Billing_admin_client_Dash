const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "user_registration",
        "login",
        "return",
        "return_request",
        "exchange", // ✅ Added for exchange notifications
        "system",
        "custom",
      ],
      default: "custom",
    },
    link: {
      type: String, // e.g., "/bill/:id" or "/exchanged-bill/:id"
    },
    data: {
      type: Object, // Optional structured payload
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
