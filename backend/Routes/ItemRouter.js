const express = require('express');
const router = express.Router();
const {
  createItem,
  getAllItems,
  getItemsByRole,
  deleteItem,
  getItemById,
  updateItem,
} = require('../Controllers/ItemController');

const {
  isLoggedIn,
  isEditorOrAdmin,
  isAdmin,
} = require("../Middlewares/AuthMiddleware");

// ✅ Import multer config
const multer = require("multer");
const path = require("path");

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

// ✅ Static routes FIRST
router.post('/add', isLoggedIn, isEditorOrAdmin, upload.single("image"), createItem);
router.get('/my-items', isLoggedIn, isEditorOrAdmin, getItemsByRole);
router.get('/all', isLoggedIn, isAdmin, getAllItems);

// ✅ Dynamic routes AFTER static
router.get('/:id', isLoggedIn, isEditorOrAdmin, getItemById);
router.put('/:id', isLoggedIn, isEditorOrAdmin, updateItem);
router.delete('/:id', isLoggedIn, isEditorOrAdmin, deleteItem);

module.exports = router;
