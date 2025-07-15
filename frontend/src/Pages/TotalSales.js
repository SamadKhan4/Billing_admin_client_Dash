import React, { useEffect, useState } from "react";
import axios from "axios";

const TotalSales = () => {
  const [totalSales, setTotalSales] = useState(0);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const res = await axios.get(
          "http://localhost:5000/api/bills/total-sales-details",
          config
        );

        setTotalSales(res.data.totalSales || 0);
        setBills(Array.isArray(res.data.bills) ? res.data.bills : []);
      } catch (err) {
        setError("Failed to fetch sales data");
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  if (loading) return <p>Loading sales data...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-yellow-40 rounded-lg shadow-md mt-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Total Sales Overview</h1>

      <div className="text-2xl font-semibold mb-4 text-green-700">
        Total Sales: ₹{Number(totalSales || 0).toLocaleString()}
      </div>

      <div className="max-h-96 overflow-y-auto border border-gray-300 rounded p-4">
        <h2 className="text-xl font-semibold mb-3">Sales by Bill Number:</h2>
        {bills.length === 0 ? (
          <p>No bills found.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {bills.map(({ billNumber, totalAmount }, index) => (
              <li
                key={`${billNumber}-${index}`}
                className="flex justify-between py-2 text-gray-800"
              >
                <span>Bill No: {billNumber}</span>
                <span>₹{Number(totalAmount || 0).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TotalSales;
