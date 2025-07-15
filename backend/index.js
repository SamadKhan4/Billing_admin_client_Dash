const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Ensure 'uploads' folder exists
const uploadPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
  console.log("📁 'uploads' folder created");
}

// ✅ Middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // serve static files

// ✅ Root route (optional health check)
app.get("/", (req, res) => {
  res.send("✅ Server is running!");
});

// ✅ Import routes
const UserRouter = require("./Routes/UserRouter");
const BillRouter = require("./Routes/BillRouter");
const ItemRouter = require("./Routes/ItemRouter");
const VendorRouter = require("./Routes/VendorRouter");
const ExchangeRouter = require("./Routes/ExchangeRoutes");
const ReturnRouter = require("./Routes/ReturnRouter");
const NotificationRouter = require("./Routes/NotificationRouter");
const createDefaultAdmin = require("./utils/createDefaultAdmin"); // ✅ Imported

// ✅ Use routes
app.use("/users", UserRouter);                  // User auth + profile
app.use("/auth", UserRouter);                   // Optional duplicate
app.use("/api/bills", BillRouter);              // Bill routes
app.use("/api/items", ItemRouter);              // Items
app.use("/api", VendorRouter);                  // Vendors
app.use("/api", ExchangeRouter);                // Exchange
app.use("/api/returns", ReturnRouter);          // Returns
app.use("/api", NotificationRouter);            // Notifications

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI)
.then(async () => {
  console.log("✅ MongoDB connected");

  await createDefaultAdmin(); // ✅ Automatically create Ritesh Ramtekkar (admin)

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
})
.catch((err) => {
  console.error("❌ MongoDB connection error:", err);
});

// ✅ Optional: Global error handler (for unhandled errors)
app.use((err, req, res, next) => {
  console.error("🔥 Global Error:", err);
  res.status(500).json({ msg: "Something went wrong", error: err.message });
});
