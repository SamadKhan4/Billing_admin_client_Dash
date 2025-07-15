const mongoose = require("mongoose");

const exchangeRequestSchema = new mongoose.Schema(
  {
    billId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bill",
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    newItem: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ExchangeRequest", exchangeRequestSchema);
