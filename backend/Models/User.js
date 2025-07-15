const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    userType: {
      type: String,
      required: true,
    },
    profilePicUrl: {
      type: String, // ✅ Correctly added for storing uploaded photo
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
