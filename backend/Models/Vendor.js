const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  vendorName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  category: { type: String, default: "" },
  products: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true }
    }
  ],
  createdBy: { type: String }, // username or user ID
}, { timestamps: true });

module.exports = mongoose.model('Vendor', vendorSchema);
