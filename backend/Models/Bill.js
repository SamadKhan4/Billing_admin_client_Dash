const mongoose = require('mongoose');
const { Schema } = mongoose;

// Item sub-schema
const itemSchema = new Schema({
  itemName: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  salePrice: { type: Number, default: 0 }
}, { _id: false });

// ✅ Return sub-schema with forced _id
const returnSchema = new Schema({
  itemName: { type: String, required: true },
  quantity: { type: Number, required: true },
  salePrice: { type: Number, required: true },
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  refundAllotted: { type: Boolean, default: false }
}, { _id: true }); // <-- Ensure _id is present

// ✅ Exchange sub-schema (optional for clarity)
const exchangeSchema = new Schema({
  oldItem: { type: String, required: true },
  oldItemPrice: { type: Number },
  newItem: { type: String, required: true },
  newItemPrice: { type: Number },
  quantity: { type: Number, required: true },
  reason: { type: String },
  refunded: { type: Boolean, default: false },
  difference: { type: Number }
}, { _id: false });

// Bill schema
const billSchema = new Schema({
  customerName: { type: String, required: true, trim: true },
  customerPhone: { type: String, trim: true },
  customerEmail: { type: String, trim: true, lowercase: true },

  billNumber: { type: String, required: true, unique: true, trim: true },
  billDate: { type: Date, required: true },
  billTime: { type: String },

  paymentStatus: {
    type: String,
    enum: ['Paid', 'Unpaid', 'Pending'],
    default: 'Paid'
  },

  paymentMethod: {
    type: String,
    enum: ['Cash', 'Card', 'UPI', 'N/A'],
    default: 'Cash'
  },

  items: {
    type: [itemSchema],
    required: true,
    validate: {
      validator: v => Array.isArray(v) && v.length > 0,
      message: "At least one item is required."
    }
  },

  subTotal: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },

  totalAmount: { type: Number, required: true },
  amountPaid: { type: Number, default: 0 },
  balanceDue: { type: Number, default: 0 },

  agentName: { type: String, trim: true },
  commission: { type: Number, default: 0 },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  returnStatus: {
    type: String,
    enum: ["Pending", "Approved", "Rejected", null],
    default: null
  },

  refundAmount: { type: Number, default: 0 }, // ✅ Only one declaration!

  returns: [returnSchema], // ✅ Embedded with _id enabled

  exchanges: [exchangeSchema], // ✅ Optional clarity

  exchangeFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bill",
    default: null
  }

}, { timestamps: true });

const Bill = mongoose.model('Bill', billSchema);
module.exports = Bill;
