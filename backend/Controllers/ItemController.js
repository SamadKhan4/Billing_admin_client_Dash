const Item = require('../Models/Item');

// ✅ Create new item with image
const createItem = async (req, res) => {
  try {
    const {
      name,
      costPrice,
      salePrice,
      stock,
      vendorName,
      category,
      commission,
    } = req.body;

    const createdBy = req.user.username;
    const createdByRole = req.user.userType?.toLowerCase();

    if (!name || !costPrice || !salePrice || !stock) {
      return res.status(400).json({ error: "❌ All fields are required" });
    }

    if (isNaN(costPrice) || isNaN(salePrice) || isNaN(stock)) {
      return res.status(400).json({ error: "❌ Price and stock must be numeric values" });
    }

    if (commission && isNaN(commission)) {
      return res.status(400).json({ error: "❌ Commission must be a numeric value" });
    }

    const existingItem = await Item.findOne({
      name: name.trim().toLowerCase(),
      vendorName: vendorName || "",
      createdBy,
    });

    if (existingItem) {
      return res.status(400).json({
        error: `🛑 Item "${name}" already exists in View Products.`,
      });
    }

    const image = req.file ? req.file.filename : "";

    const newItem = new Item({
      name: name.trim().toLowerCase(),
      costPrice,
      salePrice,
      stock,
      vendorName: vendorName || "",
      category: category || "",
      commission: commission || 0,
      createdBy,
      createdByRole,
      image,
    });

    await newItem.save();

    res.status(201).json({
      message: "✅ Item created successfully",
      item: newItem,
    });
  } catch (error) {
    console.error("❌ Error creating item:", error);
    res.status(500).json({ error: "❌ Failed to create item" });
  }
};

// ✅ Get items created by current user
const getItemsByRole = async (req, res) => {
  try {
    const username = req.user.username;
    const items = await Item.find({ createdBy: username });
    res.status(200).json(items);
  } catch (err) {
    console.error("❌ Error fetching user-specific items:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get all items (admin only)
const getAllItems = async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) {
    console.error('❌ Error fetching all items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
};

// ✅ Delete item by ID
const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Item.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ msg: "Item not found" });
    }
    res.status(200).json({ msg: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "❌ Server error", error: err.message });
  }
};

// ✅ Get item by ID (for prefill)
const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ msg: "Item not found" });
    res.status(200).json(item);
  } catch (err) {
    res.status(500).json({ msg: "❌ Server error", error: err.message });
  }
};

// ✅ Update item by ID (text fields only)
const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, costPrice, salePrice, stock } = req.body;

    const updatedItem = await Item.findByIdAndUpdate(
      id,
      { name, costPrice, salePrice, stock },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ msg: "Item not found" });
    }

    res.status(200).json({ msg: "✅ Item updated successfully", item: updatedItem });
  } catch (err) {
    res.status(500).json({ msg: "❌ Server error", error: err.message });
  }
};

module.exports = {
  createItem,
  getItemsByRole,
  getAllItems,
  deleteItem,
  getItemById,
  updateItem,
};
