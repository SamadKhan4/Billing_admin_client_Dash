const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
    },
    costPrice: {
      type: Number,
      required: [true, "Cost price is required"],
      min: [0, "Cost price cannot be negative"],
    },
    salePrice: {
      type: Number,
      required: [true, "Sale price is required"],
      min: [0, "Sale price cannot be negative"],
    },
    stock: {
      type: Number,
      required: [true, "Stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    vendorName: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "",
      trim: true,
    },
    commission: {
      type: Number,
      default: 0,
      min: [0, "Commission cannot be negative"],
    },
    createdBy: {
      type: String,
      required: true,
      trim: true,
    },
    createdByRole: {
      type: String,
      enum: ['admin', 'editor'],
      required: true,
      lowercase: true,
      trim: true,
    },
    image: {
      type: String, // filename of the uploaded image
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Item', itemSchema);
