const mongoose = require("mongoose");

const returnRequestSchema = new mongoose.Schema({
  billId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Bill"
  },
  billNumber: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  products: [
    {
      itemName: {
        type: String,
        required: true
      },
      quantity: {
        type: Number,
        required: true
      },
      salePrice: {
        type: Number,
        required: true
      }
    }
  ],
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  status: {
    type: String,
    default: "Pending",
    enum: ["Pending", "Approved", "Rejected"]
  },
  refunded: { type: Boolean, default: false },
}, {
  timestamps: true
});

module.exports = mongoose.model("ReturnRequest", returnRequestSchema);
