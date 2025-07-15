import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const ViewBillWithAgent = () => {
  const { id } = useParams();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState("");
  const [paySuccess, setPaySuccess] = useState("");
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("Cash");

  const fetchBill = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`http://localhost:5000/api/bills/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBill(res.data);
      setSelectedPaymentMethod(res.data.paymentMethod || "Cash");
    } catch (err) {
      console.error("Error fetching bill:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBill();
  }, [id]);

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
            body { font-family: sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 8px; border: 1px solid #ccc; }
            h1, h2, h3, h4 { color: #222; }
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

  if (loading)
    return <p className="p-6 text-center text-gray-500 text-lg font-medium">Loading...</p>;

  if (!bill)
    return <p className="p-6 text-center text-red-600 text-lg font-semibold">Bill not found</p>;

  const canMarkAsPaid =
    bill.paymentStatus === "Unpaid" ||
    bill.paymentStatus === "Pending" ||
    bill.paymentStatus === "N/A";

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white rounded-lg shadow-lg border border-gray-200" id="bill-content">
      <h1 className="text-3xl font-bold mb-8 text-yellow-600 flex items-center gap-3">
        <span className="text-4xl">🧾</span> Bill Details (with Agent)
      </h1>

      {/* Bill details grid */}
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

      {/* Items table */}
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

      {/* ✅ Agent Info */}
      {bill.agentName?.trim() && bill.commission > 0 && (
        <div className="max-w-md ml-auto mb-6 bg-blue-50 border border-blue-300 rounded-lg p-4 shadow-inner text-gray-900">
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

      {/* Summary */}
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

      {/* Mark as Paid */}
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

      {/* Download Button */}
      <div className="flex justify-end mt-10 gap-4">
        <button
          onClick={handleDownloadBill}
          className="px-5 py-2 rounded-md bg-black hover:bg-gray-800 text-white font-semibold shadow"
        >
          Download and Print Bill
        </button>
      </div>
    </div>
  );
};

export default ViewBillWithAgent;
