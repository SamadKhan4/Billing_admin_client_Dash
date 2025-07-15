// 📁 ReturnController.js
const ReturnRequest = require("../Models/ReturnRequest");
const Notification = require("../Models/Notification");
const Item = require("../Models/Item");
const Bill = require("../Models/Bill");
const mongoose = require("mongoose");
const User = require("../Models/User"); // add this at the top if not already present


exports.submitReturnRequest = async (req, res) => {
  try {
    const { billId, billNumber, reason, products } = req.body;

    if (!products || !products.length) {
      return res.status(400).json({ msg: "No items selected for return." });
    }

    const requestedBy = req.user.id;

    const newRequest = new ReturnRequest({
      billId,
      billNumber,
      reason,
      products,
      requestedBy: req.user.id,
      status: "Pending",
    });

    await newRequest.save();

    // ✅ Fetch the bill to get customer name
    const bill = await Bill.findById(billId);
    if (!bill) {
      return res.status(404).json({ msg: "Bill not found" });
    }

    // ✅ Create formatted message for admins
    const message =
      `🚨 Return request.\n` +
      `Bill No: ${bill.billNumber}\n` +
      `Customer Name: ${bill.customerName}\n` +
      `Item: ${products[0].itemName}\n` +
      `Qty: ${products[0].quantity}\n` +
      `Sale Price :- ${products[0].salePrice}`;

    // ✅ Send notification to all admin users
    const admins = await User.find({ userType: "Admin" });
    for (const admin of admins) {
      await Notification.create({
        userId: admin._id,
        type: "return_request",
        message,
        data: newRequest._id,
      });
    }

    res.status(201).json({ msg: "Return request submitted and admin notified." });

  } catch (err) {
    console.error("❌ Error in submitReturnRequest:", err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

exports.approveReturnRequest = async (req, res) => {
  try {
    const request = await ReturnRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ msg: "Request not found" });

    // ✅ Update item stock
    for (const prod of request.products) {
      await Item.findOneAndUpdate(
        { name: prod.itemName },
        { $inc: { stock: prod.quantity } }
      );
    }

    // ✅ Update request status
    request.status = "Approved";
    await request.save();

    // ✅ Fetch related bill
    const bill = await Bill.findById(request.billId);
    if (!bill) return res.status(404).json({ msg: "Bill not found" });

    // ✅ Push returned items to bill
    for (const prod of request.products) {
      bill.returns.push({
        itemName: prod.itemName,
        quantity: prod.quantity,
        salePrice: prod.salePrice,
        status: "Approved",
        refundAllotted: false,
      });
    }

    // ✅ Update bill return status
    bill.returnStatus = "Approved";
    await bill.save();

    // ✅ Prepare notification
    const message =
      `✅ Return request approved for\n` +
      `Bill No. :- ${bill.billNumber}\n` +
      `Customer Name :- ${bill.customerName}\n` +
      `Item :- ${request.products[0].itemName}\n` +
      `Qty :- ${request.products[0].quantity}\n` +
      `Sale Price :- ${request.products[0].salePrice}\n` +
      `Please Provide Refund.`;

    await Notification.create({
      userId: request.requestedBy,
      message,
    });

    res.json({ msg: "Return approved, stock updated, and request marked as approved." });

  } catch (err) {
    console.error("❌ Error approving return request:", err);
    res.status(500).json({ msg: "Error approving request" });
  }
};

exports.rejectReturnRequest = async (req, res) => {
  try {
    const request = await ReturnRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ msg: "Request not found" });

    // ✅ Fetch related bill
    const bill = await Bill.findById(request.billId);
    if (!bill) return res.status(404).json({ msg: "Bill not found" });

    // ✅ Update request status
    request.status = "Rejected";
    await request.save();

    // ✅ Prepare notification
    const message =
      `❌ Return request rejected for\n` +
      `Bill No. :- ${bill.billNumber}\n` +
      `Customer Name :- ${bill.customerName}\n` +
      `Item :- ${request.products[0].itemName}\n` +
      `Qty :- ${request.products[0].quantity}\n` +
      `Sale Price :- ${request.products[0].salePrice}`;

    await Notification.create({
      userId: request.requestedBy,
      message,
    });

    res.json({ msg: "Return request rejected and status updated." });

  } catch (err) {
    console.error("❌ Error rejecting return request:", err);
    res.status(500).json({ msg: "Error rejecting request" });
  }
};

// ✅ Refund approved return items
exports.refundApprovedReturns = async (req, res) => {
  const { billId } = req.params;

  try {
    const bill = await Bill.findById(billId);
    if (!bill) return res.status(404).json({ msg: "Bill not found" });

    let updated = false;
    bill.returns = bill.returns.map(ret => {
      if (ret.status === "Approved" && !ret.refundAllotted) {
        updated = true;
        return { ...ret.toObject(), refundAllotted: true };
      }
      return ret;
    });

    if (!updated) return res.status(400).json({ msg: "No approved return items to refund" });

    await bill.save();
    res.status(200).json({ msg: "Refund Allotted Successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
};

exports.allotRefund = async (req, res) => {
  const { returnId } = req.params;
  console.log("🔁 Refund allotment initiated for returnId:", returnId);

  // ✅ Ensure valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(returnId)) {
    return res.status(400).json({ msg: "Invalid return ID format" });
  }

  try {
    // 🔍 Search for the bill containing this return
    const bill = await Bill.findOne({ "returns._id": returnId });

    if (!bill) {
      console.warn("❌ Bill not found with this returnId:", returnId);
      return res.status(404).json({ msg: "Bill not found with this return ID" });
    }

    // 🎯 Update refundAllotted flag
    let updated = false;

    bill.returns = bill.returns.map(ret => {
      if (ret._id.toString() === returnId) {
        if (ret.refundAllotted) {
          console.log("⚠️ Refund already allotted for this item.");
          return ret;
        }
        updated = true;
        return { ...ret.toObject(), refundAllotted: true };
      }
      return ret;
    });

    if (!updated) {
      console.warn("⚠️ Return found, but refund already allotted or no update needed.");
      return res.status(400).json({ msg: "No eligible return found to allot refund." });
    }

    await bill.save();

    console.log("✅ Refund successfully allotted for returnId:", returnId);
    return res.status(200).json({ msg: "✅ Refund Allotted Successfully" });

  } catch (err) {
    console.error("❌ Server error in allotRefund:", err);
    res.status(500).json({ msg: "Server error during refund allotment" });
  }
};

// ✅ Get all return requests (for admin)
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await ReturnRequest.find()
      .sort({ createdAt: -1 })
      .populate("billId", "billNumber customerName")
      .populate("requestedBy", "username"); // ✅ Add this line

    res.status(200).json(requests);
  } catch (err) {
    console.error("❌ Error fetching return requests:", err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};





