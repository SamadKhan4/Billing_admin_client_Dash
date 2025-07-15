const express = require("express");
const router = express.Router();

const {
  createBill,
  getAllBills,
  getBillById,
  updateBill,
  deleteBill,
  getBillsCountByUserRole,
  getBillSummary,
  getUniqueCustomers,
  getBillsByStatus,
  getAllUniqueCustomers,
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
  deleteAgentCommission, // ✅ NEW controller for deleting an agent
  getBillsForAgent,
  getTopCustomers,
  getTopEditors,
  getWeeklySales,
  getTopCustomersForEditor,
  getEditorWeeklySales,
  getBillByIdWithAgent,
  getAllExchangedBills,
  getExchangeBillCount,
  getReturnBillCount,
  getEditorExchangeBillCount,
  getEditorReturnBillCount,
  getBillByNumber,
  getBillSuggestions,
  getBillsByEditor,
  getEditorBillSuggestions,
} = require("../Controllers/BillController");

const {
  isLoggedIn,
  isEditorOrAdmin,
  isAdmin,
} = require("../Middlewares/AuthMiddleware");

// ======================
// Agent Routes
// ======================

router.get("/agent-bills/:name", isLoggedIn, isEditorOrAdmin, getBillsForAgent);
router.get("/agents", isLoggedIn, isEditorOrAdmin, getAllAgentsWithCommission);
router.delete("/delete-agent/:name", isLoggedIn, isEditorOrAdmin, deleteAgentCommission); // ✅ New

// ======================
// Editor-Specific Routes
// ======================

router.get('/editor/:id', isLoggedIn, isAdmin, getBillsByEditor); // paginated
router.get('/editor/:id/suggestions', isLoggedIn, isAdmin, getEditorBillSuggestions); // suggestions
router.get("/mine/suggestions", isLoggedIn, getBillSuggestions);
router.get("/number/:billNumber", isLoggedIn, getBillByNumber);
router.get("/count/my/exchange", isLoggedIn, getEditorExchangeBillCount);
router.get("/count/my/return", isLoggedIn, getEditorReturnBillCount);
router.get("/count/exchange", isLoggedIn, isEditorOrAdmin, getExchangeBillCount);
router.get("/count/return", isLoggedIn, isEditorOrAdmin, getReturnBillCount);
router.get("/top-customers/my", isLoggedIn, isEditorOrAdmin, getTopCustomersForEditor);
router.get("/editor-sales-detail", isLoggedIn, isEditorOrAdmin, getEditorWeeklySales);
router.get("/customer/my/:name", isLoggedIn, isEditorOrAdmin, getEditorCustomerBillsByName);
router.get("/mine", isLoggedIn, isEditorOrAdmin, getMyBills);
router.get("/editor-sales-details", isLoggedIn, isEditorOrAdmin, getEditorSalesDetails);
router.get("/my/count", isLoggedIn, isEditorOrAdmin, getEditorBillCount);
router.get("/customers/my", isLoggedIn, isEditorOrAdmin, getEditorCustomers);
router.get("/summary/my", isLoggedIn, isEditorOrAdmin, getMyBillSummary);

// ======================
// Admin-Only Routes
// ======================

router.get("/customer-by-name/:name", isLoggedIn, isAdmin, getBillsByCustomerName);
router.get("/total-sales-details", isLoggedIn, isAdmin, getTotalSalesDetails);
router.get("/customers/list", isLoggedIn, isAdmin, getAllUniqueCustomers);
router.get("/unique-customers", isLoggedIn, isAdmin, getUniqueCustomers);
router.get("/all", isLoggedIn, isAdmin, getAllBills);
router.get("/top-customers", isLoggedIn, isAdmin, getTopCustomers);
router.get("/top-editors", isLoggedIn, isAdmin, getTopEditors);
router.get("/weekly-sales", isLoggedIn, isAdmin, getWeeklySales);

// ======================
// Editor or Admin Routes
// ======================

router.get("/exchanged", isLoggedIn, isEditorOrAdmin, getAllExchangedBills);
router.get("/next-bill-number", isLoggedIn, isEditorOrAdmin, getNextBillNumber);
router.post("/", isLoggedIn, isEditorOrAdmin, createBill);
router.get("/status", isLoggedIn, isEditorOrAdmin, getBillsByStatus);
router.get("/count", isLoggedIn, isEditorOrAdmin, getBillsCountByUserRole);
router.get("/summary", isLoggedIn, isEditorOrAdmin, getBillSummary);
router.get("/bills", isLoggedIn, isEditorOrAdmin, getBills);
router.get("/status-ratio", isLoggedIn, isEditorOrAdmin, getBillsStatusRatio);

// ======================
// Dynamic Routes - must be at the end!
// ======================

router.get("/with-agent/:id", isLoggedIn, isEditorOrAdmin, getBillByIdWithAgent); 
router.get("/:id", isLoggedIn, isEditorOrAdmin, getBillById);
router.put("/:id", isLoggedIn, isEditorOrAdmin, updateBill);
router.delete("/:id", isLoggedIn, isAdmin, deleteBill);

module.exports = router;
