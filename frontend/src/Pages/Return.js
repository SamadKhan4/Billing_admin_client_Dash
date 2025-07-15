import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const Return = () => {
  const { id } = useParams();
  const [bill, setBill] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBill = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:5000/api/bills/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBill(res.data);
      } catch (err) {
        console.error("❌ Error fetching bill:", err);
        alert("Failed to load bill data.");
      }
    };
    fetchBill();
  }, [id]);

  const toggleItemSelection = (index) => {
    const item = bill.items[index];
    setSelectedItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
    setQuantities((prev) => ({ ...prev, [index]: item.quantity }));
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");

    const selectedData = selectedItems.map((i) => ({
      item: bill.items[i],
      quantity: quantities[i] || 1,
    }));

    if (selectedData.length === 0 || !reason || (reason === "Other" && !customReason)) {
      alert("Please select items and provide a reason.");
      return;
    }

    const products = selectedData.map((s) => ({
      itemName: s.item.itemName || s.item.name,
      quantity: s.quantity,
      salePrice: s.item.salePrice,
    }));

    try {
      await axios.post("http://localhost:5000/api/returns/submit", {
        billId: bill._id,
        billNumber: bill.billNumber,
        reason: reason === "Other" ? customReason : reason,
        products,
      }, {
        headers: { Authorization: `Bearer ${token}` },   // ✅ Must be present
      });

      alert("✅ Return request submitted successfully.");
      navigate("/dashboard");
    } catch (err) {
      console.error("❌ Return request failed:", err.response?.data || err.message);
      alert("Failed to submit return request. Please try again.");
    }
  };

  if (!bill) return <p>Loading...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📦 Return Items</h1>
      <p><strong>Bill Number:</strong> {bill.billNumber}</p>
      <p><strong>Customer Name:</strong> {bill.customerName}</p>

      <div className="mt-4">
        {bill.items.map((item, index) => (
          <div
            key={index}
            className="border p-4 rounded mb-2 flex flex-col gap-1 bg-gray-50"
          >
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                onChange={() => toggleItemSelection(index)}
                checked={selectedItems.includes(index)}
              />
              <span>
                {item.name || item.itemName} (Qty: {item.quantity}) - ₹{item.salePrice}
              </span>
            </label>
            {selectedItems.includes(index) && (
              <input
                type="number"
                min={1}
                max={item.quantity}
                value={quantities[index] || item.quantity}
                onChange={(e) =>
                  setQuantities({
                    ...quantities,
                    [index]: Math.min(item.quantity, Number(e.target.value)),
                  })
                }
                className="border px-2 py-1 rounded w-24"
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-4">
        <label className="block font-semibold">Reason for return:</label>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option value="">-- Select Reason --</option>
          <option value="Wrong product delivered">Wrong product delivered</option>
          <option value="Damaged product">Damaged product</option>
          <option value="Expired product">Expired product</option>
          <option value="Customer doesn't want it">Customer doesn't want it</option>
          <option value="Other">Other</option>
        </select>
        {reason === "Other" && (
          <input
            type="text"
            placeholder="Enter your reason"
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            className="mt-2 border p-2 rounded w-full"
          />
        )}
      </div>

      <button
        onClick={handleSubmit}
        className="mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Submit Return Request
      </button>
    </div>
  );
};

export default Return;
