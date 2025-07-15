const Vendor = require('../Models/Vendor');

// ✅ Create a new Vendor
const createVendor = async (req, res) => {
  try {
    const username = req.user.username;
    const { vendorName, phone, email, address, products, category } = req.body;

    if (!vendorName || !phone || !email || !address || !products || products.length === 0 || !category) {
      return res.status(400).json({ msg: "❌ All fields including category are required and at least one product." });
    }

    const newVendor = new Vendor({
      vendorName,
      phone,
      email,
      address,
      category,
      products,
      createdBy: username,
    });

    await newVendor.save();
    res.status(201).json({ msg: "✅ Vendor created successfully", vendor: newVendor });
  } catch (err) {
    console.error("❌ Vendor creation error:", err.message);
    res.status(500).json({ msg: "❌ Server error while creating vendor", error: err.message });
  }
};

// ✅ Get all vendors (Editor gets own vendors, Admin gets all)
const getVendors = async (req, res) => {
  try {
    const { username, userType } = req.user;
    const { name } = req.query;

    let query = {};
    if (userType === 'Editor') {
      query.createdBy = username;
    } else if (userType !== 'Admin') {
      return res.status(403).json({ msg: '❌ Unauthorized user type' });
    }

    if (name) {
      query.vendorName = { $regex: new RegExp(name, 'i') };
    }

    const vendors = await Vendor.find(query).sort({ createdAt: -1 });
    res.status(200).json(vendors);
  } catch (err) {
    console.error('❌ Vendor fetch error:', err.message);
    res.status(500).json({ msg: '❌ Error fetching vendors', error: err.message });
  }
};

// ✅ Delete a vendor by ID
const deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ msg: '❌ Vendor not found' });
    }

    await Vendor.findByIdAndDelete(req.params.id);
    res.status(200).json({ msg: '✅ Vendor deleted successfully' });
  } catch (err) {
    console.error("❌ Error deleting vendor:", err.message);
    res.status(500).json({ msg: '❌ Server error', error: err.message });
  }
};

// ✅ Get products of a vendor by exact name
const getVendorByName = async (req, res) => {
  try {
    const { vendorName } = req.params;
    const { username, userType } = req.user;

    let query = { vendorName };

    if (userType === 'Editor') {
      query.createdBy = username;
    }

    const vendor = await Vendor.findOne(query);
    if (!vendor) {
      return res.status(404).json({ msg: "❌ Vendor not found or unauthorized access" });
    }

    res.status(200).json(vendor.products); // Return only product list
  } catch (err) {
    console.error("❌ Error fetching vendor products:", err.message);
    res.status(500).json({ msg: "❌ Server error", error: err.message });
  }
};

// ✅ Get vendor products by ID
const getVendorProductsById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ msg: "❌ Vendor not found" });
    }

    res.status(200).json(vendor.products);
  } catch (err) {
    console.error("❌ Error fetching vendor products by ID:", err.message);
    res.status(500).json({ msg: "❌ Server error", error: err.message });
  }
};

module.exports = {
  createVendor,
  getVendors,
  deleteVendor,
  getVendorByName,
  getVendorProductsById
};
