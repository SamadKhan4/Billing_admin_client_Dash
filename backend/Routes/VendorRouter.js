const express = require('express');
const router = express.Router();
const {
  isLoggedIn,
  isEditorOrAdmin,
  isAdmin,
} = require('../Middlewares/AuthMiddleware');

const {
  createVendor,
  getVendors,
  deleteVendor,
  getVendorByName,
  getVendorProductsById, // ✅ new controller for fetching products by vendor ID
} = require('../Controllers/VendorController');

// ✅ Create a new vendor
router.post('/vendors', isLoggedIn, isEditorOrAdmin, createVendor);

// ✅ Get all vendors
router.get('/vendors', isLoggedIn, isEditorOrAdmin, getVendors);

// ✅ Get vendor by name (searching)
router.get('/vendor-products/:vendorName', isLoggedIn, getVendorByName);

// ✅ Get all products of a specific vendor by ID (used in AddItems)
router.get('/vendors/:id/products', isLoggedIn, getVendorProductsById); // ✅ new route

// ✅ Delete a vendor
router.delete('/vendors/:id', isLoggedIn, deleteVendor);

module.exports = router;
