import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
} from "recharts";

const BillRatio = () => {
  const [statusRatio, setStatusRatio] = useState({ Paid: 0, Unpaid: 0, Pending: 0 });

  const API_BASE = "http://localhost:5000";

  useEffect(() => {
    const fetchRatio = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE}/api/bills/status-ratio`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStatusRatio(res.data);
      } catch (err) {
        console.error("Error fetching status ratio:", err);
      }
    };

    fetchRatio();
  }, []);

  const chartData = [
    { name: "Paid", value: statusRatio.Paid, fill: "#86efac" },     // Soft green
    { name: "Unpaid", value: statusRatio.Unpaid, fill: "#fca5a5" }, // Soft red
    { name: "Pending", value: statusRatio.Pending, fill: "#fde68a" }, // Soft yellow
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100 py-10 px-4 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-10 drop-shadow-sm">
        📊 Bill Payment Status Ratio
      </h1>

      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-4xl border border-yellow-100">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={chartData}
            barCategoryGap={60}
            margin={{ top: 30, right: 30, left: 0, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              dataKey="name"
              tick={{ fill: "#4b5563", fontSize: 14, fontWeight: 600 }}
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: "#4b5563", fontSize: 14 }}
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#f9fafb",
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
                fontSize: "14px",
              }}
            />
            <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={60}>
              <LabelList dataKey="value" position="top" style={{ fill: "#111827", fontWeight: "bold" }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BillRatio;
