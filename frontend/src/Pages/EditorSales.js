import React, { useEffect, useState } from "react";
import axios from "axios";

const EditorSales = () => {
  const [totalSales, setTotalSales] = useState(0);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEditorSales = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };

        // API should return sales data only for the logged-in editor
        const res = await axios.get(
          "http://localhost:5000/api/bills/editor-sales-details",
          config
        );

        setTotalSales(res.data.totalSales || 0);
        setBills(res.data.bills || []);
      } catch (err) {
        setError("Failed to fetch editor sales data");
      } finally {
        setLoading(false);
      }
    };

    fetchEditorSales();
  }, []);

  if (loading) return <p>Loading editor sales data...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md mt-6">
      <h1 className="text-3xl font-bold mb-6 text-center">My Sales Overview</h1>

      <div className="text-2xl font-semibold mb-4 text-blue-700">
        Total Sales: ₹{totalSales.toLocaleString()}
      </div>

      <div className="max-h-96 overflow-y-auto border border-gray-300 rounded p-4">
        <h2 className="text-xl font-semibold mb-3">Sales by Bill Number:</h2>
        {bills.length === 0 ? (
          <p>No bills found.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {bills.map(({ billNumber, totalAmount }) => (
              <li
                key={billNumber}
                className="flex justify-between py-2 text-gray-800"
              >
                <span>Bill No: {billNumber}</span>
                <span>₹{totalAmount.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default EditorSales;
