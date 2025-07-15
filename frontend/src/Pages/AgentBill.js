import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const AgentBill = () => {
  const { id } = useParams(); // bill id from route
  const [bill, setBill] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBill = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:5000/api/bills/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBill(res.data);
      } catch (err) {
        setError("Failed to fetch bill details.");
        console.error(err);
      }
    };

    fetchBill();
  }, [id]);

  if (error) return <p className="text-red-600 text-center mt-10">{error}</p>;
  if (!bill) return <p className="text-center mt-10">Loading bill details...</p>;

  const {
    billNumber,
    billDate,
    billTime,
    customerName,
    createdBy,
    agentName,
    items,
  } = bill;

  const productCommissions = items?.map((item) => {
    const commissionPercent = Number(item.commission || 0);
    const commissionAmount =
      (item.salePrice || 0) * (item.quantity || 1) * (commissionPercent / 100);

    return {
      name: item.itemName,
      commissionAmount: commissionAmount.toFixed(2),
    };
  });

  const totalCommission = productCommissions.reduce(
    (sum, item) => sum + parseFloat(item.commissionAmount),
    0
  );

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
        Agent Commission Details
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
        <div><strong>Bill No:</strong> {billNumber}</div>
        <div><strong>Created By:</strong> {createdBy}</div>
        <div><strong>Date:</strong> {billDate}</div>
        <div><strong>Time:</strong> {billTime}</div>
        <div><strong>Customer Name:</strong> {customerName}</div>
        <div><strong>Agent Name:</strong> {agentName || "N/A"}</div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Product-wise Commission (₹)
        </h3>
        {productCommissions.map((item, idx) => (
          <div
            key={idx}
            className="flex justify-between p-2 border-b text-sm text-gray-600"
          >
            <span>Product: <strong>{item.name}</strong></span>
            <span>Commission: ₹{item.commissionAmount}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t pt-4 text-lg font-bold text-right text-green-700">
        Total Commission: ₹{totalCommission.toFixed(2)}
      </div>

      <div className="mt-6 text-xs text-gray-400 text-center">
        © {new Date().getFullYear()} Billing System — Agent Summary
      </div>
    </div>
  );
};

export default AgentBill;
