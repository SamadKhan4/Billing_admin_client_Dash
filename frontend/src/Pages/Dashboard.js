import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  FileText,
  DollarSign,
  Repeat,
  RotateCcw,
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [customerCount, setCustomerCount] = useState(0);
  const [billsCreatedByMe, setBillsCreatedByMe] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [topCustomers, setTopCustomers] = useState([]);
  const [weeklySales, setWeeklySales] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exchangeBillCount, setExchangeBillCount] = useState(0);
  const [returnBillCount, setReturnBillCount] = useState(0);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username") || "User";
    setUsername(storedUsername);

    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        };

        const [
          customersRes,
          billsRes,
          salesRes,
          topCustomersRes,
          weeklySalesRes,
          exchangeRes,
          returnRes
        ] = await Promise.all([
          fetch("http://localhost:5000/api/bills/customers/my", config),
          fetch("http://localhost:5000/api/bills/my/count", config),
          fetch("http://localhost:5000/api/bills/summary/my", config),
          fetch("http://localhost:5000/api/bills/top-customers/my", config),
          fetch("http://localhost:5000/api/bills/editor-sales-detail", config),
          fetch("http://localhost:5000/api/bills/count/my/exchange", config),
          fetch("http://localhost:5000/api/bills/count/my/return", config),
        ]);

        const customersData = await customersRes.json();
        const billsData = await billsRes.json();
        const salesData = await salesRes.json();
        const topCustomersData = await topCustomersRes.json();
        const weeklySalesData = await weeklySalesRes.json();
        const exchangeData = await exchangeRes.json();
        const returnData = await returnRes.json();

        setCustomerCount(customersData.customers?.length || 0);
        setBillsCreatedByMe(billsData.count || 0);
        setTotalSales(Number(salesData.totalSales || 0));
        setTopCustomers(topCustomersData || []);
        setWeeklySales(Number(weeklySalesData.totalRevenue || 0));
        setExchangeBillCount(exchangeData.count || 0);
        setReturnBillCount(returnData.count || 0);
      } catch (error) {
        console.error("❌ Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const cardData = [
    {
      title: `Customers (${username})`,
      value: customerCount,
      icon: <Users className="text-yellow-500 w-6 h-6" />,
      color: "bg-yellow-90 border-l-4 border-yellow-400",
      shadow: "rgba(234, 179, 8, 0.3)",
      onClick: () => navigate("/editor/customers"),
    },
    {
      title: `Bills Created by ${username}`,
      value: billsCreatedByMe,
      icon: <FileText className="text-orange-500 w-6 h-6" />,
      color: "bg-yellow-90 border-l-4 border-orange-400",
      shadow: "rgba(251, 146, 60, 0.3)",
      onClick: () => navigate("/editor-bills"),
    },
    {
      title: "Total Sales",
      value: `₹${Number(totalSales).toFixed(2)}`,
      icon: <DollarSign className="text-green-500 w-6 h-6" />,
      color: "bg-yellow-90 border-l-4 border-green-400",
      shadow: "rgba(34, 197, 94, 0.3)",
      onClick: () => navigate("/editor/sales"),
    },
    {
      title: "Exchange Bills",
      value: exchangeBillCount,
      icon: <Repeat className="text-blue-600 w-6 h-6" />,
      color: "bg-yellow-90 border-l-4 border-blue-400",
      shadow: "rgba(59, 130, 246, 0.3)",
      onClick: () => navigate("/exchanged-bills"),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-gray-600 text-xl font-medium animate-pulse">
          Loading Editor Dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-6 pt-20 sm:pt-10">
      {/* Header */}
      <div className="mb-4 flex justify-center items-center">
        <h1 className="text-3xl font-bold text-gray-800 text-center">Editor Dashboard</h1>
      </div>

      {/* Welcome */}
      <p className="text-lg text-gray-700 mb-6 font-medium text-center sm:text-left">
        Welcome Editor, <span className="font-bold text-gray-900">{username}</span>
      </p>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cardData.map((card, index) => (
          <div
            key={index}
            onClick={card.onClick}
            className={`${card.color} p-6 rounded-xl cursor-pointer transform transition-all duration-300 hover:scale-105`}
            style={{ boxShadow: `0 4px 10px ${card.shadow}` }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = `0 8px 20px ${card.shadow}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = `0 4px 10px ${card.shadow}`;
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-700">{card.title}</h2>
                <p className="text-2xl font-bold mt-1 text-gray-900">{card.value}</p>
              </div>
              <div className="bg-gray-100 p-2 rounded-full">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Top 3 Customers */}
      <div className="bg-gray-100 p-5 rounded-xl shadow mt-10">
        <h3 className="text-xl font-semibold mb-2">👑 Favourite Customers (Top 3)</h3>
        {topCustomers.length > 0 ? (
          <ul className="list-disc list-inside text-gray-800">
            {topCustomers.map((cust, idx) => (
              <li key={idx}>
                {cust._id} — <span className="font-semibold">{cust.billCount}</span> bills
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600 italic">No customer data yet</p>
        )}
      </div>

      {/* Weekly Sales */}
      <div className="bg-gray-100 p-5 rounded-xl shadow mt-6 mb-10">
        <h3 className="text-xl font-semibold mb-2">📅 Weekly Sales</h3>
        <p className="text-2xl font-bold text-green-600">
          ₹{weeklySales.toFixed(2)}
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
