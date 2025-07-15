import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, DollarSign, UserCheck, Repeat } from 'lucide-react';

const AdminPanel = () => {
  const [totalCustomers, setTotalCustomers] = useState(null);
  const [totalBills, setTotalBills] = useState(null);
  const [totalSales, setTotalSales] = useState(null);
  const [totalEditors, setTotalEditors] = useState(null);
  const [topEditors, setTopEditors] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [weeklySales, setWeeklySales] = useState(0);
  const [exchangeCount, setExchangeCount] = useState(0); // ✅ FIXED
  const [returnCount, setReturnCount] = useState(0); // ✅ FIXED
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const API_BASE = 'http://localhost:5000';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const storedUsername = localStorage.getItem('username');
        if (!token) throw new Error('Not authenticated');
        if (storedUsername) setUsername(storedUsername);

        const [
          resSummary,
          resCustomers,
          resEditors,
          resTopEditors,
          resTopCustomers,
          resWeeklySales,
          resExchangeCount,
          resReturnCount,
        ] = await Promise.all([
          fetch(`${API_BASE}/api/bills/summary`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/api/bills/unique-customers`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/users/editors-count`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/api/bills/top-editors`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/api/bills/top-customers`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/api/bills/weekly-sales`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/api/bills/count/exchange`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/api/bills/count/return`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const summary = await resSummary.json();
        const customerData = await resCustomers.json();
        const editorData = await resEditors.json();
        const topEditorsData = await resTopEditors.json();
        const topCustomersData = await resTopCustomers.json();
        const weeklySalesData = await resWeeklySales.json();
        const exchangeData = await resExchangeCount.json();
        const returnData = await resReturnCount.json();

        setTotalBills(summary.totalBills ?? 0);
        setTotalSales(summary.totalSales ?? 0);
        setTotalCustomers(customerData.count ?? 0);
        setTotalEditors(editorData.count ?? 0);
        setTopEditors(topEditorsData ?? []);
        setTopCustomers(topCustomersData ?? []);
        setWeeklySales(weeklySalesData.totalRevenue ?? 0);
        setExchangeCount(exchangeData.count ?? 0); // ✅ FIXED
        setReturnCount(returnData.count ?? 0); // ✅ FIXED
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-gray-600 text-xl font-medium animate-pulse">Loading Admin Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded max-w-md mx-auto mt-10 shadow">
        <p className="font-semibold">Error: {error}</p>
      </div>
    );
  }

  const cardData = [
    {
      title: 'Total Users',
      value: totalEditors ?? 0,
      icon: <UserCheck className="text-blue-500 w-6 h-6" />,
      color: 'bg-yellow-90 border-l-4 border-blue-400',
      shadow: 'rgba(59, 130, 246, 0.3)',
      onClick: () => navigate('/total-editors'),
    },
    {
      title: 'Total Customers',
      value: totalCustomers ?? 0,
      icon: <Users className="text-yellow-500 w-6 h-6" />,
      color: 'bg-yellow-90 border-l-4 border-yellow-400',
      shadow: 'rgba(234, 179, 8, 0.3)',
      onClick: () => navigate('/total-customers'),
    },
    {
      title: 'Total Bills',
      value: totalBills ?? 0,
      icon: <FileText className="text-orange-500 w-6 h-6" />,
      color: 'bg-yellow-90 border-l-4 border-orange-400',
      shadow: 'rgba(251, 146, 60, 0.3)',
      onClick: () => navigate('/total-bills'),
    },
    {
      title: 'Total Sales',
      value: totalSales !== null ? `₹${totalSales.toFixed(2)}` : '₹0.00',
      icon: <DollarSign className="text-green-500 w-6 h-6" />,
      color: 'bg-yellow-90 border-l-4 border-green-400',
      shadow: 'rgba(34, 197, 94, 0.3)',
      onClick: () => navigate('/total-sales'),
    },
    {
      title: 'Exchange Bills',
      value: exchangeCount ?? 0,
      icon: <Repeat className="text-purple-500 w-6 h-6" />,
      color: 'bg-yellow-90 border-l-4 border-purple-400',
      shadow: 'rgba(168, 85, 247, 0.3)',
      onClick: () => navigate('/exchanged-bills'),
    },
  ];

  return (
    <div className="min-h-screen bg-white px-6 pt-20 sm:pt-10">
      <div className="mb-4 flex justify-center">
        <h1 className="text-3xl font-bold text-gray-800 text-center">Admin Dashboard</h1>
      </div>

      <p className="text-lg text-gray-700 mb-6 font-medium text-center sm:text-left">
        Welcome Admin, <span className="font-bold text-gray-900">{username}</span>
      </p>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cardData.map((card, index) => (
          <div
            key={index}
            onClick={card.onClick}
            className={`${card.color} p-6 rounded-xl cursor-pointer transform transition-all duration-300 hover:scale-105`}
            style={{ boxShadow: `0 4px 10px ${card.shadow}` }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = `0 8px 20px ${card.shadow}`)}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = `0 4px 10px ${card.shadow}`)}
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

      {/* Additional Insights */}
      <div className="mt-10 space-y-6">
        {/* Top Editors */}
        <div className="bg-gray-100 p-5 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-2">🛠️ Top Editors</h3>
          {topEditors.length > 0 ? (
            <ul className="list-disc list-inside text-gray-800">
              {topEditors.map((editor, idx) => (
                <li key={idx}>
                  {editor.username} — {editor.billCount} bills
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 italic">No editor data available</p>
          )}
        </div>

        {/* Favourite Customers */}
        <div className="bg-gray-100 p-5 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-2">👑 Favourite Customers (Top 3)</h3>
          {topCustomers.length > 0 ? (
            <ul className="list-disc list-inside text-gray-800">
              {topCustomers.map((customer, idx) => (
                <li key={idx}>
                  {customer._id} — {customer.billCount} bills
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 italic">No top customer data</p>
          )}
        </div>

        {/* Weekly Sales */}
        <div className="bg-gray-100 p-5 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-2">📅 Weekly Sales</h3>
          <p className="text-2xl font-bold text-green-600">₹{weeklySales.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
