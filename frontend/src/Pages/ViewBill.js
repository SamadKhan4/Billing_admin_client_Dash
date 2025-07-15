import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";

const ViewBill = () => {
  const { id } = useParams();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState("");
  const [paySuccess, setPaySuccess] = useState("");
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("Cash");
  const [showReturnExchangeDialog, setShowReturnExchangeDialog] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const returnStatusFromNav = location.state?.returnStatus;
  const returnedItemsFromNav = location.state?.returnedItems;

  const fetchBill = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`http://localhost:5000/api/bills/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBill(res.data);
      setSelectedPaymentMethod(res.data.paymentMethod || "Cash");
      console.log("🧾 Agent Details:", res.data.agentName, res.data.commission);
    } catch (err) {
      console.error("Error fetching bill:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBill();
  }, [id, location.search]);

  const handleShowPaymentOptions = () => {
    setPayError("");
    setPaySuccess("");
    setShowPaymentOptions(true);
  };

  const handleConfirmPayment = async () => {
    setPayLoading(true);
    setPayError("");
    setPaySuccess("");

    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `http://localhost:5000/api/bills/${id}`,
        {
          paymentStatus: "Paid",
          paymentMethod: selectedPaymentMethod,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await fetchBill();
      setPaySuccess("Bill marked as paid successfully!");
      setShowPaymentOptions(false);
    } catch (error) {
      setPayError("Failed to mark bill as paid. Please try again.");
      console.error(error);
    } finally {
      setPayLoading(false);
    }
  };

  const handleDownloadBill = () => {
    const content = document.getElementById("bill-content")?.innerHTML;
    const printWindow = window.open("", "", "width=800,height=600");

    printWindow.document.write(`
      <html>
        <head>
          <title>Download Bill</title>
          <style>
            body {
              font-family: sans-serif;
              padding: 20px;
              color: #222;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              padding: 8px;
              border: 1px solid #ccc;
              text-align: left;
            }
            h1, h2, h3, h4 {
              color: #222;
            }
            @media print {
              .agent-info-print-hidden {
                display: none !important;
              }
            }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handleDownloadAgentBill = () => {
    const agentBillHTML = `
    <div style="padding: 20px; font-family: sans-serif; color: #222;">
      <h1 style="color: #333;">👤 Agent Bill</h1>
      <p><strong>Agent Name:</strong> ${bill.agentName || "N/A"}</p>
      <p><strong>Commission Amount:</strong> ₹${(bill.commission || 0).toFixed(2)}</p>
      <p><strong>Bill No:</strong> ${bill.billNumber}</p>
      <p><strong>Customer:</strong> ${bill.customerName}</p>
      <p><strong>Bill Date:</strong> ${new Date(bill.billDate).toLocaleDateString()}</p>
      <p><strong>Sub Total:</strong> ₹${bill.subTotal.toFixed(2)}</p>
      <p><strong>Commission Status:</strong> ${bill.commission > 0 ? "Included" : "Not Applicable"
      }</p>
    </div>
  `;

    const printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.write(`
    <html>
      <head>
        <title>Agent Bill</title>
        <style>
          body { font-family: sans-serif; padding: 20px; color: #222; }
          h1 { color: #000; }
          p { font-size: 16px; margin: 6px 0; }
        </style>
      </head>
      <body>${agentBillHTML}</body>
    </html>
  `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handleRefund = async (ret) => {
    console.log("🟢 Refund clicked for returnId:", ret._id);

    const token = localStorage.getItem("token");

    try {
      const res = await axios.patch(
        `http://localhost:5000/api/returns/refund/${ret._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("✅ " + res.data.msg);
      fetchBill(); // Re-fetch to get updated refundAllotted value
    } catch (error) {
      console.error("❌ Refund error:", error);
      alert("❌ " + (error?.response?.data?.msg || "Failed to allot refund"));
    }
  };

  if (loading)
    return <p className="p-6 text-center text-gray-500 text-lg font-medium">Loading...</p>;

  if (!bill)
    return <p className="p-6 text-center text-red-600 text-lg font-semibold">Bill not found</p>;

  const canMarkAsPaid =
    bill.paymentStatus === "Unpaid" ||
    bill.paymentStatus === "Pending" ||
    bill.paymentStatus === "N/A";

  // ✅ Return Eligibility Logic
  const billDate = new Date(bill.billDate);
  const today = new Date();
  const diffDays = Math.floor((today - billDate) / (1000 * 60 * 60 * 24));
  const isReturnEligible = diffDays <= 7;

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white rounded-lg shadow-lg border border-gray-200" id="bill-content">
      <h1 className="text-3xl font-bold mb-8 text-yellow-600 flex items-center gap-3">
        <span className="text-4xl">🧾</span> Bill Details
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 text-gray-700">
        <div className="space-y-2">
          <p><span className="font-semibold text-gray-900">Bill No:</span> {bill.billNumber}</p>
          <p><span className="font-semibold text-gray-900">Customer:</span> {bill.customerName}</p>
          <p><span className="font-semibold text-gray-900">Email:</span> {bill.customerEmail}</p>
          <p><span className="font-semibold text-gray-900">Created By:</span> {bill.createdBy?.username || "N/A"}</p>
        </div>
        <div className="space-y-2">
          <p><span className="font-semibold text-gray-900">Date:</span> {new Date(bill.billDate).toLocaleDateString()}</p>
          <p><span className="font-semibold text-gray-900">Time:</span> {bill.billTime || "N/A"}</p>
          <p><span className="font-semibold text-gray-900">Phone:</span> {bill.customerPhone}</p>
          <p>
            <span className="font-semibold text-gray-900">Payment Status:</span>{" "}
            <span className={`font-bold ${bill.paymentStatus === "Paid"
              ? "text-green-600"
              : bill.paymentStatus === "Unpaid"
                ? "text-red-600"
                : "text-yellow-600"}`}>
              {bill.paymentStatus}
            </span>
          </p>
          <p>
            <span className="font-semibold text-gray-900">Payment Method:</span>{" "}
            {bill.paymentMethod || "N/A"}
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b border-yellow-400 pb-2">
        🛒 Items
      </h2>
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full bg-gray-50 rounded-md shadow-sm">
          <thead>
            <tr className="bg-yellow-100 text-yellow-900">
              <th className="py-3 px-4 text-left font-medium">Item</th>
              <th className="py-3 px-4 text-center font-medium">Qty</th>
              <th className="py-3 px-4 text-right font-medium">Sale Price</th>
              <th className="py-3 px-4 text-right font-medium">Total (Sale)</th>
            </tr>
          </thead>
          <tbody>
            {bill.items.map((item, index) => (
              <tr
                key={index}
                className={`border-b border-gray-200 ${index % 2 === 0 ? "bg-white" : "bg-yellow-50"}`}
              >
                <td className="py-3 px-4">{item.itemName}</td>
                <td className="py-3 px-4 text-center">{item.quantity}</td>
                <td className="py-3 px-4 text-right text-black font-medium">₹{item.salePrice?.toFixed(2)}</td>
                <td className="py-3 px-4 text-right text-black font-semibold">
                  ₹{(item.quantity * item.salePrice).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {bill.agentName?.trim() && bill.commission > 0 && (
        <div className="agent-info-print-hidden max-w-md ml-auto mb-6 bg-blue-50 border border-blue-300 rounded-lg p-4 shadow-inner text-gray-900">
          <h3 className="text-lg font-semibold mb-2 text-blue-700">Agent Information</h3>
          <div className="space-y-1">
            <p className="flex justify-between">
              <span className="font-medium">Agent Name:</span>
              <span>{bill.agentName}</span>
            </p>
            <p className="flex justify-between">
              <span className="font-medium">Commission Amount:</span>
              <span>₹{(bill.commission || 0).toFixed(2)}</span>
            </p>
            <p className="flex justify-between">
              <span className="font-medium">Commission Status:</span>
              <span className="text-green-600 font-semibold">Included</span>
            </p>
          </div>
        </div>
      )}

      {bill.exchanges && bill.exchanges.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold text-lg text-blue-700 mb-2">🔁 Exchange Details</h3>
          {bill.exchanges.map((ex, index) => (
            <Box key={index} p={2} mt={2} border="1px solid #ccc" borderRadius={2}>
              <Typography fontWeight="bold">Exchange #{index + 1}</Typography>
              <Typography>Old Item: {ex.oldItem}</Typography>
              <Typography>New Item: {ex.newItem}</Typography>
              <Typography>Quantity: {ex.quantity}</Typography>
              <Typography>
                {ex.refunded
                  ? `Refunded Amount: ₹${Math.abs(ex.difference)}`
                  : `Remaining Amount Paid: ₹${ex.difference}`}
              </Typography>
            </Box>
          ))}
        </div>
      )}

      <div className="max-w-md ml-auto bg-yellow-50 border border-yellow-300 rounded-lg p-6 shadow-inner space-y-2 text-gray-900">
        <p className="flex justify-between font-semibold">
          <span>Subtotal:</span> <span>₹{bill.subTotal.toFixed(2)}</span>
        </p>
        <p className="flex justify-between">
          <span>Discount:</span>{" "}
          <span>{bill.discount}% (₹{bill.discountAmount.toFixed(2)})</span>
        </p>
        <p className="flex justify-between">
          <span>Tax:</span> <span>{bill.tax}% (₹{bill.taxAmount.toFixed(2)})</span>
        </p>
        <hr className="border-yellow-400" />
        <p className="flex justify-between text-lg font-bold">
          <span>Total:</span> <span>₹{bill.totalAmount.toFixed(2)}</span>
        </p>
      </div>

      {canMarkAsPaid && (
        <div className="max-w-md ml-auto mt-10 p-6 border border-yellow-400 rounded-lg bg-yellow-100 shadow-md text-center">
          {!showPaymentOptions ? (
            <>
              <p className="mb-4 text-yellow-900 font-semibold">
                This bill is currently <span className="capitalize">{bill.paymentStatus}</span>.<br />
                Click below to mark as paid.
              </p>
              <button
                onClick={handleShowPaymentOptions}
                className="px-6 py-2 rounded-md font-semibold bg-yellow-600 hover:bg-yellow-700 text-white transition"
              >
                Mark as Paid
              </button>
            </>
          ) : (
            <>
              <label htmlFor="paymentMethodSelect" className="block mb-2 font-semibold text-yellow-900">
                Select Payment Method:
              </label>
              <select
                id="paymentMethodSelect"
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                className="w-full p-2 mb-4 rounded border border-yellow-300"
              >
                <option value="N/A">N/A</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
              </select>

              {payError && <p className="mb-2 text-red-600 font-semibold">{payError}</p>}
              {paySuccess && <p className="mb-2 text-green-600 font-semibold">{paySuccess}</p>}
              <button
                onClick={handleConfirmPayment}
                disabled={payLoading}
                className={`px-6 py-2 rounded-md font-semibold ${payLoading ? "bg-yellow-400 cursor-not-allowed" : "bg-yellow-600 hover:bg-yellow-700 text-white"} transition`}
              >
                {payLoading ? "Processing..." : "Confirm Payment"}
              </button>
            </>
          )}
        </div>
      )}

      {/* ✅ Return / Exchange Section */}
      {bill.returnStatus ? (
        <div className="mt-10 p-4 bg-yellow-50 border border-yellow-400 rounded text-center shadow">
          <p className="text-yellow-800 font-medium text-base">
            🔒 Return/Exchange already processed.
          </p>
          <p className="text-sm text-gray-600 mt-1 italic">
            Note: One-time Return/Exchange policy has been utilized.
          </p>
        </div>
      ) : isReturnEligible ? (
        <div className="mt-10 text-right">
          <button
            onClick={() => setShowReturnExchangeDialog(true)}
            className="px-5 py-2 rounded-md bg-green-600 text-white font-medium hover:bg-green-700 shadow"
          >
            Initiate Return / Exchange
          </button>
          <p className="text-sm mt-1 text-gray-500 italic">
            Return / Exchange available until{" "}
            {new Date(billDate.setDate(billDate.getDate() + 7)).toLocaleDateString()}
          </p>

          {/* ✅ Dialog Box */}
          <Dialog
            open={showReturnExchangeDialog}
            onClose={() => setShowReturnExchangeDialog(false)}
          >
            <DialogTitle>Select Action</DialogTitle>
            <DialogContent>
              <p className="text-gray-800 text-base">
                Do you want to return or exchange this product?
              </p>
            </DialogContent>
            <DialogActions>
              <button
                onClick={() => navigate(`/return/${bill._id}`)}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded shadow"
              >
                Return
              </button>
              <button
                onClick={() => navigate(`/exchange/${bill._id}`)}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded shadow"
              >
                Exchange
              </button>
            </DialogActions>
          </Dialog>
        </div>
      ) : (
        <div className="mt-10 text-right">
          <p className="text-sm font-medium text-red-600">
            Return / Exchange window expired (Only within 7 days of billing).
          </p>
        </div>
      )}

      {(bill.returns?.length > 0 || returnedItemsFromNav?.length > 0) && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-red-600 mb-3">🔄 Returned Items</h2>
          <table className="min-w-full bg-red-50 rounded-md">
            <thead>
              <tr className="bg-red-100 text-red-900">
                <th className="py-2 px-4 text-left">Item</th>
                <th className="py-2 px-4 text-center">Qty</th>
                <th className="py-2 px-4 text-right">Sale Price</th>
                <th className="py-2 px-4 text-center">Status</th>
                <th className="py-2 px-4 text-center">Refund</th>
              </tr>
            </thead>
            <tbody>
              {(bill.returns?.length > 0 ? bill.returns : returnedItemsFromNav).map((ret, idx) => (
                <tr key={idx} className="border-b border-red-200">
                  <td className="py-2 px-4">{ret.itemName}</td>
                  <td className="py-2 px-4 text-center">{ret.quantity}</td>
                  <td className="py-2 px-4 text-right font-medium text-black">
                    ₹{ret.salePrice?.toFixed(2)}
                  </td>
                  <td className="py-2 px-4 text-center font-semibold">
                    {ret.status === "Approved" ? (
                      <span className="text-green-600">Approved</span>
                    ) : ret.status === "Rejected" ? (
                      <span className="text-red-600">Rejected</span>
                    ) : (
                      <span className="text-yellow-600">Pending</span>
                    )}
                  </td>
                  <td className="py-2 px-4 text-center">
                    {ret.status === "Approved" && !ret.refundAllotted ? (
                      <button
                        className="px-3 py-1 text-sm rounded bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleRefund(ret)}
                      >
                        Refund
                      </button>
                    ) : ret.refundAllotted ? (
                      <span className="text-green-700 font-semibold">Refund Allotted</span>
                    ) : ret.status === "Rejected" ? (
                      <span className="text-red-600 font-semibold">Refund Rejected</span>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Bill Download Buttons - bottom-right aligned and smaller */}
      <div className="flex justify-end mt-10">
        <div className="flex flex-col items-end space-y-2">
          <button
            onClick={handleDownloadBill}
            className="px-4 py-1.5 text-sm rounded bg-blue-600 hover:bg-blue-700 text-white font-medium shadow"
          >
            Download and Print Bill
          </button>

          {bill.agentName?.trim() && bill.commission > 0 && (
            <button
              onClick={handleDownloadAgentBill}
              className="px-4 py-1.5 text-sm rounded bg-blue-600 hover:bg-blue-700 text-white font-medium shadow"
            >
              Download Agent Bill
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewBill;
