const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const {
  registerUser,
  registerCustomer,
  registerAgent, // ✅ new controller
  registerVendor,
  loginUser,
  getOwnProfileData,
  updateOwnProfileData,
  updateOwnProfileDataWithPhoto,
  deleteOwnProfileData,
  getOneUser,
  deleteOneUser,
  updateOneUser,
  getTotalCustomerCount,
  getTotalEditors,
  getAllEditors,
  getAllCustomers,
  getAllAgents,
  getAllVendors,
} = require("../Controllers/UserController");

const {
  isLoggedIn,
  isAdmin,
  isEditorOrAdmin,
} = require("../Middlewares/AuthMiddleware");

// ✅ Multer setup for profile photo upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, `profile-${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage });

// ✅ PUBLIC ROUTES
router.post("/login", loginUser);
router.post("/register", registerUser);

// ✅ New: Create Customer & Agent (by admin/editor)
router.post("/register-customer", isLoggedIn, isEditorOrAdmin, registerCustomer);
router.post("/register-agent", isLoggedIn, isAdmin, registerAgent);
router.post("/register-vendor", isLoggedIn, isAdmin, registerVendor);

// ✅ AUTHENTICATED USER ROUTES
router.get("/myprofile", isLoggedIn, getOwnProfileData);
router.patch("/myprofile", isLoggedIn, updateOwnProfileData);
router.put("/updateprofile", isLoggedIn, upload.single("photo"), updateOwnProfileDataWithPhoto);
router.delete("/myprofile", isLoggedIn, deleteOwnProfileData);

// ✅ ADMIN-ONLY ROUTES
router.get("/customers",isLoggedIn, isAdmin, getAllCustomers);
router.get("/agents",isLoggedIn, isAdmin,getAllAgents);
router.get("/vendors",isLoggedIn, isAdmin, getAllVendors);
router.post("/create-editor", isLoggedIn, isAdmin, registerUser);
router.get("/customers-count", isLoggedIn, isAdmin, getTotalCustomerCount);
router.get("/editors-count", isLoggedIn, isAdmin, getTotalEditors);
router.get("/editors", isLoggedIn, isAdmin, getAllEditors);
router.get("/:id", isLoggedIn, isAdmin, getOneUser);
router.patch("/:id", isLoggedIn, isAdmin, updateOneUser);
router.delete("/:id", isLoggedIn, isAdmin, deleteOneUser);

module.exports = router;
