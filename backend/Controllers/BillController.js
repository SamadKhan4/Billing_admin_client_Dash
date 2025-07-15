const Bill = require("../Models/Bill");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const Item = require("../Models/Item");
const User = require("../Models/User");

// ✅ Get next auto-incremented bill number
const getNextBillNumber = async (req, res) => {
  try {
    const lastBill = await Bill.findOne().sort({ createdAt: -1 });

    let nextBillNumber = "BILL-0001"; // default
    if (lastBill && lastBill.billNumber) {
      const lastNumber = parseInt(lastBill.billNumber.split("-")[1]);
      const nextNumber = (lastNumber + 1).toString().padStart(4, "0");
      nextBillNumber = `BILL-${nextNumber}`;
    }

    res.status(200).json({ nextBillNumber });
  } catch (error) {
    console.error("Failed to generate bill number:", error);
    res.status(500).json({ msg: "Failed to generate bill number" });
  }
};

// ✅ Create a new bill
const createBill = async (req, res) => {
  try {
    // Generate next bill number
    const lastBill = await Bill.findOne().sort({ createdAt: -1 });
    let nextBillNumber = "BILL-0001";

    if (lastBill?.billNumber) {
      const lastNumber = parseInt(lastBill.billNumber.split("-")[1]);
      const nextNumber = (lastNumber + 1).toString().padStart(4, "0");
      nextBillNumber = `BILL-${nextNumber}`;
    }

    // Capitalize helper
    const capitalizeFirst = (str) =>
      typeof str === "string"
        ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
        : "";

    // Extract and validate fields
    let {
      customerName,
      customerPhone,
      customerEmail,
      dueDate,
      paymentStatus = "Unpaid",
      paymentMethod = "Cash",
      items,
      discount = 0,
      tax = 0,
      amountPaid = 0,
      agentName = "",
      commission = 0,
    } = req.body;

    // Validate payment status
    paymentStatus = capitalizeFirst(paymentStatus);
    const validStatuses = ["Paid", "Unpaid", "Pending"];
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({ msg: `❌ Invalid payment status: ${paymentStatus}` });
    }

    const validPaidMethods = ["Cash", "Card", "UPI"];
    const validAllMethods = ["Cash", "Card", "UPI", "N/A"];

    if (paymentStatus !== "Paid") {
      paymentMethod = "N/A";
    } else {
      paymentMethod = capitalizeFirst(paymentMethod);
      if (!validPaidMethods.includes(paymentMethod)) {
        return res.status(400).json({
          msg: `❌ Invalid payment method for Paid: ${paymentMethod}. Allowed: ${validPaidMethods.join(", ")}`,
        });
      }
    }

    if (!validAllMethods.includes(paymentMethod)) {
      return res.status(400).json({ msg: `❌ Invalid payment method.` });
    }

    // Validate required fields
    if (!customerName || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ msg: "❌ Missing customer name or items are invalid" });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ msg: "❌ Unauthorized: Missing user" });
    }

    // Calculate totals
    const subTotal = items.reduce((acc, item) => acc + item.quantity * item.salePrice, 0);
    const discountAmount = (subTotal * discount) / 100;
    const taxableAmount = subTotal - discountAmount;
    const taxAmount = (taxableAmount * tax) / 100;
    const totalAmount = taxableAmount + taxAmount;
    const balanceDue = totalAmount - amountPaid;

    // Save bill first
    const newBill = new Bill({
      customerName,
      customerPhone,
      customerEmail,
      dueDate,
      paymentStatus,
      paymentMethod,
      items,
      discount,
      tax,
      amountPaid,
      billNumber: nextBillNumber,
      billDate: new Date(),
      billTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      subTotal,
      discountAmount,
      taxAmount,
      totalAmount,
      balanceDue,
      agentName,
      commission,
      createdBy: req.user.id,
    });

    await newBill.save();

    // Update stock for each item
    for (const item of items) {
      const dbItem = await Item.findById(item._id);

      if (!dbItem) {
        return res.status(404).json({ msg: `❌ Item not found in DB: ${item.name || item._id}` });
      }

      if (dbItem.stock < item.quantity) {
        return res.status(400).json({
          msg: `❌ Not enough stock for item: ${dbItem.name}. Available: ${dbItem.stock}, Required: ${item.quantity}`,
        });
      }

      dbItem.stock -= item.quantity;
      await dbItem.save();
    }

    return res.status(201).json({ msg: "✅ Bill created successfully", bill: newBill });
  } catch (error) {
    console.error("❌ Bill creation failed:", error);
    return res.status(500).json({ msg: "❌ Server error", error: error.message });
  }
};


// ✅ Get all bills (admin use)
// ✅ GET /api/bills/all?search=somevalue
const getAllBills = async (req, res) => {
  try {
    const { search } = req.query;

    let query = {};
    if (search) {
      const regex = new RegExp(search, 'i');
      query = {
        $or: [
          { billNumber: regex },         // matches "BILL-0028" or "0028"
          { customerName: regex },       // matches "ravi" or "Ravi"
        ],
      };
    }

    const bills = await Bill.find(query)
      .sort({ createdAt: -1 })
      .populate("createdBy", "username");

    res.status(200).json(bills);
  } catch (error) {
    console.error("Failed to fetch bills:", error);
    res.status(500).json({ msg: "❌ Failed to fetch bills", error: error.message });
  }
};


// ✅ Get bill by ID
const getBillById = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id).populate("createdBy", "username");
    if (!bill) return res.status(404).json({ msg: "❌ Bill not found" });
    res.status(200).json(bill);
  } catch (error) {
    console.error("Error retrieving bill:", error);
    res.status(500).json({ msg: "❌ Error retrieving bill", error: error.message });
  }
};

// ✅ Update bill by ID
const updateBill = async (req, res) => {
  try {
    if (req.body.billNumber || req.body.billDate) {
      return res.status(400).json({ msg: "❌ Cannot modify billNumber or billDate" });
    }

    const updateFields = {
      ...req.body,
      billTime: req.body.billTime || new Date().toLocaleTimeString(), // Ensure billTime is present
      updatedAt: new Date()
    };

    const updatedBill = await Bill.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true
    });

    if (!updatedBill) return res.status(404).json({ msg: "❌ Bill not found" });

    res.status(200).json({ msg: "✅ Bill updated", bill: updatedBill });
  } catch (error) {
    console.error("❌ Failed to update bill:", error);
    res.status(400).json({ msg: "❌ Failed to update bill", error: error.message });
  }
};

// ✅ Delete bill
const deleteBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ msg: "❌ Bill not found" });

    await bill.deleteOne();
    res.status(200).json({ msg: "✅ Bill deleted successfully" });
  } catch (error) {
    console.error("Failed to delete bill:", error);
    res.status(500).json({ msg: "❌ Failed to delete bill", error: error.message });
  }
};

// ✅ Get count of all bills
const getBillsCountByUserRole = async (req, res) => {
  try {
    const count = await Bill.countDocuments();
    res.status(200).json({ count });
  } catch (error) {
    console.error("Failed to count bills:", error);
    res.status(500).json({ msg: "❌ Failed to count bills", error: error.message });
  }
};

// ✅ Get summary
const getBillSummary = async (req, res) => {
  try {
    const bills = await Bill.find();
    const totalBills = bills.length;
    const totalSales = bills.reduce((acc, b) => acc + (b.totalAmount || 0), 0);
    const totalPending = bills.filter(b => ["unpaid", "pending"].includes(b.paymentStatus?.toLowerCase())).length;

    res.status(200).json({ totalBills, totalPendingBills: totalPending, totalSales });
  } catch (error) {
    console.error("Failed to get summary:", error);
    res.status(500).json({ msg: "❌ Failed to get summary", error: error.message });
  }
};

// ✅ Get unique customers count (all)
const getUniqueCustomers = async (req, res) => {
  try {
    const bills = await Bill.find({}, "customerName"); // fetch only customerName field

    const uniqueCustomers = new Set();

    bills.forEach((bill) => {
      if (bill.customerName && typeof bill.customerName === "string") {
        const name = bill.customerName.trim().toLowerCase();
        if (name) uniqueCustomers.add(name);
      }
    });

    res.status(200).json({ count: uniqueCustomers.size });
  } catch (error) {
    console.error("Error getting unique customers:", error);
    res.status(500).json({ msg: "❌ Error getting unique customers", error: error.message });
  }
};

// ✅ Get all unique customer details (all)
const getAllUniqueCustomers = async (req, res) => {
  try {
    const { name } = req.query;

    const matchStage = name
      ? {
        $match: {
          customerName: {
            $regex: new RegExp(name.split(" ").join(".*"), "i"), // Flexible matching
          },
        },
      }
      : null;

    const pipeline = [];

    if (matchStage) pipeline.push(matchStage);

    pipeline.push(
      {
        $group: {
          _id: {
            name: "$customerName",
            email: "$customerEmail",
            phone: "$customerPhone",
          },
        },
      },
      {
        $project: {
          _id: 0,
          name: "$_id.name",
          email: "$_id.email",
          phone: "$_id.phone",
        },
      }
    );

    const customers = await Bill.aggregate(pipeline);
    res.status(200).json({ customers });
  } catch (error) {
    console.error("Failed to fetch customers:", error);
    res.status(500).json({ msg: "❌ Failed to fetch customers", error: error.message });
  }
};

// ✅ Get bills by status
const getBillsByStatus = async (req, res) => {
  try {
    const { status } = req.query;
    if (!status) {
      return res.status(400).json({ msg: "❌ status query parameter is required" });
    }

    const validStatuses = ["Paid", "Unpaid", "Pending"];
    if (!validStatuses.includes(capitalizeFirst(status))) {
      return res.status(400).json({ msg: `❌ Invalid status value. Allowed: ${validStatuses.join(", ")}` });
    }

    // Case-insensitive regex match
    const filter = { paymentStatus: new RegExp(`^${status}$`, "i") };
    const bills = await Bill.find(filter).sort({ createdAt: -1 });
    res.status(200).json(bills);
  } catch (error) {
    console.error("Failed to get bills by status:", error);
    res.status(500).json({ msg: "❌ Failed to get bills by status", error: error.message });
  }
};

// ✅ Get all bills with optional filter (status)
const getBills = async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};

    const validStatuses = ["Paid", "Unpaid", "Pending"];
    if (status && validStatuses.includes(capitalizeFirst(status))) {
      filter.paymentStatus = capitalizeFirst(status);
    }

    const bills = await Bill.find(filter).sort({ createdAt: -1 });
    res.status(200).json(bills);
  } catch (error) {
    console.error("Failed to fetch bills:", error);
    res.status(500).json({ msg: "❌ Failed to fetch bills", error: error.message });
  }
};

// ✅ Get unique customers for logged-in editor
const getEditorCustomers = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ msg: "Unauthorized: Missing user info" });
    }

    const editorId = req.user.id;
    const searchName = req.query.name;

    const matchStage = {
      createdBy: new mongoose.Types.ObjectId(editorId),
    };

    if (searchName) {
      matchStage.customerName = { $regex: new RegExp(searchName, "i") }; // Case-insensitive partial match
    }

    const customers = await Bill.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            name: "$customerName",
            email: "$customerEmail",
            phone: "$customerPhone",
          },
        },
      },
      {
        $project: {
          _id: 0,
          name: "$_id.name",
          email: "$_id.email",
          phone: "$_id.phone",
        },
      },
    ]);

    const reversed = [...customers].reverse();

    res.status(200).json({
      count: reversed.length,
      customers: reversed,
    });
  } catch (err) {
    console.error("Editor Customer Fetch Error:", err);
    res.status(500).json({
      msg: "❌ Failed to fetch editor's customers",
      error: err.message,
    });
  }
};

// ✅ Count only bills created by the logged-in editor
const getEditorBillCount = async (req, res) => {
  try {
    const editorId = req.user.id;

    const count = await Bill.countDocuments({ createdBy: editorId });

    res.status(200).json({ count });
  } catch (error) {
    console.error("Error fetching editor bill count:", error);
    res.status(500).json({ msg: "❌ Failed to get bill count", error: error.message });
  }
};

// Logged-in editor ke bills ka total sales return kare

const getMyBillSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all bills created by this user
    const bills = await Bill.find({ createdBy: userId }).select("totalAmount");

    // Sum all totalAmount values in JS (instead of aggregation)
    const totalSales = bills.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);

    res.json({ totalSales });
  } catch (error) {
    console.error("Error in getMyBillSummary:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getMyBillSummary };

// Get total sales and detailed bill list for admin (all bills)
// Get total sales and detailed bill list for admin (all bills)
const getTotalSalesDetails = async (req, res) => {
  try {
    // Aggregate total sales from all bills
    const totalSalesResult = await Bill.aggregate([
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalAmount" },
        },
      },
    ]);

    const totalSales = totalSalesResult.length > 0 ? totalSalesResult[0].totalSales : 0;

    // Find all bills with only billNumber and totalAmount fields
    const bills = await Bill.find({}, { billNumber: 1, totalAmount: 1, _id: 0 }).sort({ billNumber: 1 });

    res.json({
      totalSales,
      bills,
    });
  } catch (error) {
    console.error("Error fetching total sales details:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get total sales and detailed bill list for logged-in editor (only their bills)
const getEditorSalesDetails = async (req, res) => {
  try {
    const editorId = req.user.id; // consistent use of req.user.id

    // Aggregate total sales for this editor
    const totalSalesAggregate = await Bill.aggregate([
      { $match: { createdBy: new mongoose.Types.ObjectId(editorId) } }, // ensure ObjectId type
      { $group: { _id: null, totalSales: { $sum: "$totalAmount" } } },
    ]);

    const totalSales = totalSalesAggregate.length > 0 ? totalSalesAggregate[0].totalSales : 0;

    // Find all bills created by this editor (only selected fields)
    const bills = await Bill.find({ createdBy: editorId }).select("billNumber totalAmount").lean();

    res.json({
      totalSales,
      bills,
    });
  } catch (error) {
    console.error("Error in getEditorSalesDetails:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// src/Controllers/BillController.js

const getMyBills = async (req, res) => {
  try {
    const userId = req.user.id;
    const search = req.query.search || "";
    const all = req.query.all === "true";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    if (!userId) {
      return res.status(401).json({ msg: "User not authenticated" });
    }

    const regex = new RegExp(search, 'i');
    const query = {
      createdBy: userId,
      $or: [
        { billNumber: regex },
        { customerName: regex }
      ]
    };

    if (all) {
      // ✅ Return all bills (no pagination)
      const allBills = await Bill.find(query)
        .populate('createdBy', 'username')
        .sort({ createdAt: -1 });

      return res.status(200).json({
        bills: allBills,
        totalBills: allBills.length
      });
    }

    // 🧾 Paginated result
    const totalBills = await Bill.countDocuments(query);
    const totalPages = Math.ceil(totalBills / limit);
    const skip = (page - 1) * limit;

    const bills = await Bill.find(query)
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      bills,
      totalPages,
      currentPage: page,
      totalBills
    });
  } catch (error) {
    console.error('Error fetching bills:', error);
    res.status(500).json({ msg: "Server error while fetching your bills" });
  }
};


const getBillsStatusRatio = async (req, res) => {
  try {
    const statusCounts = await Bill.aggregate([
      {
        $group: {
          _id: "$paymentStatus",
          count: { $sum: 1 },
        },
      },
    ]);

    const ratio = {
      Paid: 0,
      Unpaid: 0,
      Pending: 0,
    };

    statusCounts.forEach((item) => {
      ratio[item._id] = item.count;
    });

    res.status(200).json(ratio);
  } catch (error) {
    console.error("Error fetching bill status ratio:", error);
    res.status(500).json({ error: "Failed to fetch bill status ratio" });
  }
};

const getBillsByMyStatus = async (req, res) => {
  try {
    const { status } = req.params;

    const validStatuses = ["Paid", "Unpaid", "Pending"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const bills = await Bill.find({ paymentStatus: status }).sort({ createdAt: -1 });
    res.status(200).json(bills);
  } catch (error) {
    console.error("Error fetching bills by status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/bills/customer-by-name/:name

// Corrected backend logic
const getBillsByCustomerName = async (req, res) => {
  const { name } = req.params;

  try {
    const bills = await Bill.find({
      customerName: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (bills.length === 0) {
      return res.json({ customer: null, bills: [] });
    }

    const firstBill = bills[0];
    const customer = {
      name: firstBill.customerName,
      email: firstBill.customerEmail,
      phone: firstBill.customerPhone,
    };

    res.json({ customer, bills });
  } catch (error) {
    console.error("Error fetching bills by customer name:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getEditorCustomerBillsByName = async (req, res) => {
  try {
    const editorId = req.user.id; // from JWT
    const customerName = req.params.name;

    const bills = await Bill.find({
      customerName: customerName,
      createdBy: editorId,
    });

    // Extract single customer details
    const first = bills[0];

    const customer = first
      ? {
        name: first.customerName,
        email: first.customerEmail,
        phone: first.customerPhone,
      }
      : null;

    res.json({ customer, bills });
  } catch (error) {
    res.status(500).json({ msg: 'Failed to fetch editor customer bills' });
  }
};

const getAllAgentsWithCommission = async (req, res) => {
  try {
    const { userType } = req.query;
    const userId = req.user.id;

    const matchStage = {
      agentName: { $nin: [null, ""] },
      commission: { $gt: 0 }
    };

    if (userType !== "admin") {
      matchStage.createdBy = new mongoose.Types.ObjectId(userId);
    }

    const agents = await Bill.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$agentName",
          totalCommission: { $sum: "$commission" },
        }
      },
      {
        $project: {
          _id: 0,
          agentName: "$_id",
          totalCommission: 1,
        }
      },
      { $sort: { agentName: 1 } }
    ]);

    res.json(agents);
  } catch (error) {
    console.error("❌ Agent commission fetch failed:", error);
    res.status(500).json({ msg: "❌ Server error", error: error.message });
  }
};


// DELETE /api/bills/delete-agent/:agentName
const deleteAgentCommission = async (req, res) => {
  const { name } = req.params;

  try {
    const result = await Bill.updateMany(
      { agentName: name },
      { $unset: { agentName: "", agentCommission: "" } }
    );

    res.status(200).json({ msg: "Agent commission deleted successfully", result });
  } catch (err) {
    console.error("❌ Error deleting agent commission:", err);
    res.status(500).json({ msg: "Failed to delete agent commission" });
  }
};

const getBillsForAgent = async (req, res) => {
  try {
    const { name } = req.params;
    const { userType } = req.query;
    const userId = req.user?.id;

    if (!name) {
      return res.status(400).json({ msg: "❌ Agent name is required." });
    }

    const filter = {
      agentName: { $regex: new RegExp(`^${name}$`, "i") }, // exact name match, case-insensitive
    };

    if (userType?.toLowerCase() === "editor" && userId) {
      filter.createdBy = new mongoose.Types.ObjectId(userId);
    }

    const bills = await Bill.find(filter).sort({ billDate: -1 });

    res.status(200).json(bills);
  } catch (error) {
    console.error("❌ Error fetching agent bills:", error);
    res.status(500).json({ msg: "❌ Failed to load agent bills.", error: error.message });
  }
};

// ✅ Top 3 Customers
const getTopCustomers = async (req, res) => {
  try {
    const topCustomers = await Bill.aggregate([
      {
        $group: {
          _id: "$customerName", // group by actual customer name
          billCount: { $sum: 1 },
        },
      },
      { $sort: { billCount: -1 } }, // highest first
      { $limit: 3 }, // top 3
    ]);

    res.status(200).json(topCustomers);
  } catch (error) {
    console.error("Error fetching top customers:", error);
    res.status(500).json({ error: "Failed to fetch top customers" });
  }
};

const getTopEditors = async (req, res) => {
  try {
    const topEditorAgg = await Bill.aggregate([
      {
        $match: {
          createdBy: { $ne: null },
        },
      },
      {
        $group: {
          _id: "$createdBy",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 3,
      },
    ]);

    const topEditors = [];

    for (const editor of topEditorAgg) {
      const user = await User.findById(editor._id).select("username email userType");

      if (!user) {
        console.warn(`⚠️ Skipped null user for ID: ${editor._id}`);
        continue;
      }

      topEditors.push({
        username: user.username,
        email: user.email,
        userType: user.userType,
        billCount: editor.count,
      });
    }

    return res.status(200).json(topEditors);
  } catch (error) {
    console.error("❌ Error in getTopEditors:", error.message);
    return res.status(500).json({
      message: "Failed to fetch top editors",
      error: error.message,
    });
  }
};


// ✅ Weekly Sales (last 7 days)
const getWeeklySales = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const sales = await Bill.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          billCount: { $sum: 1 },
        },
      },
    ]);

    if (sales.length === 0) return res.status(200).json({ totalRevenue: 0, billCount: 0 });

    res.status(200).json(sales[0]);
  } catch (error) {
    res.status(500).json({ msg: "Failed to fetch weekly sales", error: error.message });
  }
};


// ✅ Recent Bills in last 7 days
const getRecentBills = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentBills = await Bill.find({ createdAt: { $gte: sevenDaysAgo } })
      .sort({ createdAt: -1 })
      .populate("createdBy", "username");

    res.status(200).json(recentBills);
  } catch (error) {
    res.status(500).json({ msg: "Failed to fetch recent bills", error: error.message });
  }
};

// 🆕 Get Top 3 Customers FOR LOGGED-IN EDITOR
const getTopCustomersForEditor = async (req, res) => {
  try {
    const topCustomers = await Bill.aggregate([
      {
        $match: {
          createdBy: new mongoose.Types.ObjectId(req.user.id), // ✅ FIXED
        },
      },
      {
        $group: {
          _id: "$customerName",
          billCount: { $sum: 1 },
        },
      },
      {
        $sort: { billCount: -1 },
      },
      {
        $limit: 3,
      },
    ]);

    res.status(200).json(topCustomers);
  } catch (error) {
    console.error("❌ Error fetching editor's top customers:", error);
    res.status(500).json({ error: "Server error while fetching top customers" });
  }
};

const getEditorWeeklySales = async (req, res) => {
  try {
    const username = req.user.username;

    // ✅ Find the user by username to get their ObjectId
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // ✅ Use the user's ObjectId in the query
    const bills = await Bill.find({
      createdBy: user._id,
      billDate: { $gte: sevenDaysAgo }
    });

    const totalRevenue = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);

    res.status(200).json({ totalRevenue });
  } catch (error) {
    console.error("❌ Error in getEditorWeeklySales:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getBillByIdWithAgent = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: "Bill not found" });

    // Directly return the full bill (including agent details)
    res.status(200).json(bill);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllExchangedBills = async (req, res) => {
  try {
    const { userType, username } = req.user;

    let query = {
      exchangeFrom: { $exists: true },
      billNumber: { $regex: "-EX" }, // identifies exchanged bills
    };

    // Editor should only see their own exchanged bills
    if (userType === "editor") {
      query.createdBy = username;
    }

    const exchangedBills = await Bill.find(query).sort({ billDate: -1 });

    res.json(exchangedBills);
  } catch (error) {
    console.error("❌ Error fetching exchanged bills:", error);
    res.status(500).json({ msg: "Failed to fetch exchanged bills" });
  }
};

const getExchangeBillCount = async (req, res) => {
  try {
    const count = await Bill.countDocuments({ billType: "Exchange" });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ msg: "Failed to fetch exchange bill count" });
  }
};

const getReturnBillCount = async (req, res) => {
  try {
    const count = await Bill.countDocuments({ billType: "Return" });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ msg: "Failed to fetch return bill count" });
  }
};
const getEditorExchangeBillCount = async (req, res) => {
  try {
    const user = req.user;
    const count = await Bill.countDocuments({
      billType: "Exchange",
      createdBy: user.username,
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ msg: "Failed to fetch exchange bill count" });
  }
};

const getEditorReturnBillCount = async (req, res) => {
  try {
    const user = req.user;
    const count = await Bill.countDocuments({
      billType: "Return",
      createdBy: user.username,
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ msg: "Failed to fetch return bill count" });
  }
};

getSingleBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({ msg: "Bill not found" });
    }

    res.json(bill); // all item details like itemName, quantity, salePrice are already there
  } catch (err) {
    console.error("Failed to fetch bill:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

const getBillByNumber = async (req, res) => {
  try {
    const bill = await Bill.findOne({ billNumber: req.params.billNumber });
    if (!bill) return res.status(404).json({ msg: "Bill not found" });
    res.json(bill);
  } catch (err) {
    console.error("Error fetching bill by number:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

const getBillSuggestions = async (req, res) => {
  try {
    const userId = req.user.id;
    const search = req.query.search || "";
    const regex = new RegExp(search, "i");

    const bills = await Bill.find({
      createdBy: userId,
      $or: [{ billNumber: regex }, { customerName: regex }],
    }).limit(10);

    const suggestions = bills.map(
      (b) => `${b.billNumber} - ${b.customerName}`
    );

    res.json({ suggestions });
  } catch (error) {
    console.error("Suggestion error:", error);
    res.status(500).json({ msg: "Failed to fetch suggestions" });
  }
};

const getBillsByEditor = async (req, res) => {
  try {
    const editorId = req.params.id;
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const regex = new RegExp(search, "i");

    const matchStage = {
      $match: {
        createdBy: new ObjectId(editorId), // ✅ Fix: Convert to ObjectId
        $or: [
          { customerName: { $regex: regex } },
          {
            $expr: {
              $regexMatch: {
                input: { $toString: "$billNumber" }, // ✅ Match billNumber as string
                regex: regex,
              },
            },
          },
        ],
      },
    };

    // Total count
    const totalCountAgg = await Bill.aggregate([
      matchStage,
      { $count: "total" },
    ]);

    const total = totalCountAgg[0]?.total || 0;

    // Paginated bills
    const bills = await Bill.aggregate([
      matchStage,
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    res.status(200).json({
      bills,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({
      msg: "Error fetching editor's bills",
      error: error.message,
    });
  }
};

const getEditorBillSuggestions = async (req, res) => {
  try {
    const editorId = req.params.id;
    const search = req.query.search || "";
    const regex = new RegExp(search, "i");

    const suggestions = await Bill.find({
      createdBy: editorId,
      $or: [
        { billNumber: regex },
        { customerName: regex },
      ]
    })
      .limit(8)
      .select("billNumber customerName");

    const results = suggestions.map((bill) =>
      `${bill.billNumber} - ${bill.customerName}`
    );

    res.json({ suggestions: results });
  } catch (error) {
    res.status(500).json({ msg: "Suggestion fetch failed", error: error.message });
  }
};

// Helper to capitalize first letter
function capitalizeFirst(str) {
  return typeof str === "string" ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";
}

// ✅ Final unified export
module.exports = {
  createBill,
  getAllBills,
  getBillById,
  updateBill,
  deleteBill,
  getBillsCountByUserRole,
  getBillSummary,
  getUniqueCustomers,
  getAllUniqueCustomers,
  getBillsByStatus,
  getBills,
  getNextBillNumber,
  getEditorCustomers,
  getEditorBillCount,
  getMyBillSummary,
  getTotalSalesDetails,
  getEditorSalesDetails,
  getMyBills,
  getBillsStatusRatio,
  getBillsByMyStatus,
  getBillsByCustomerName,
  getEditorCustomerBillsByName,
  getAllAgentsWithCommission,
  deleteAgentCommission,
  getBillsForAgent,
  getTopCustomers,
  getTopEditors,
  getWeeklySales,
  getRecentBills,
  getTopCustomersForEditor,
  getEditorWeeklySales,
  getBillByIdWithAgent,
  getAllExchangedBills,
  getExchangeBillCount,
  getReturnBillCount,
  getEditorExchangeBillCount,
  getEditorReturnBillCount,
  getSingleBill,
  getBillByNumber,
  getBillSuggestions,
  getBillsByEditor,
  getEditorBillSuggestions,
};
