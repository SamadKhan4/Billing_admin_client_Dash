// 📁 ReturnRouter.js
const express = require("express");
const router = express.Router();
const ReturnController = require("../Controllers/ReturnController");
const { isLoggedIn, isAdmin, isEditorOrAdmin } = require("../Middlewares/AuthMiddleware");

router.post("/submit", isLoggedIn, ReturnController.submitReturnRequest); // now POST /api/returns/
router.patch("/refund/:returnId", isLoggedIn, isEditorOrAdmin, ReturnController.allotRefund);
router.put("/refund/bill/:billId", isLoggedIn, isEditorOrAdmin, ReturnController.refundApprovedReturns); // made path clear
router.get("/requests", isLoggedIn, ReturnController.getAllRequests);
router.post("/requests/:id/approve", isLoggedIn, ReturnController.approveReturnRequest);
router.post("/requests/:id/reject", isLoggedIn, ReturnController.rejectReturnRequest);


module.exports = router;
