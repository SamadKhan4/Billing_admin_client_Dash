// utils/createDefaultAdmin.js
const bcrypt = require("bcryptjs");
const User = require("../Models/User");

const createDefaultAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ username: "Ritesh Ramtekkar" });

    if (existingAdmin) {
      console.log("Default Admin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash("123456789", 10);

    const admin = new User({
      username: "Ritesh Ramtekkar",
      email: "riteshramtekkar20@gmail.com",
      phone: "7507454237",
      password: hashedPassword,//(123456789)
      userType: "Admin",
    });

    await admin.save();
    console.log("✅ Default Admin created: Ritesh Ramtekkar");
  } catch (err) {
    console.error("❌ Failed to create default admin:", err.message);
  }
};

module.exports = createDefaultAdmin;
