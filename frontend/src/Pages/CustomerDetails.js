import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Eye, Trash } from "lucide-react";

const API_BASE = "http://localhost:5000";

const CustomerDetails = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [customer, setCustomer] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchCustomerBills = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/bills/customer-by-name/${encodeURIComponent(name)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch customer bills");

        const data = await res.json();
        setBills(data.bills || []);
        setCustomer(data.customer || {});
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerBills();
  }, [name, token]);

  const handleView = (id) => {
    navigate(`/bill/${id}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this bill?")) return;

    try {
      const res = await fetch(`${API_BASE}/api/bills/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.msg || "Failed to delete bill");

      setBills((prev) => prev.filter((bill) => bill._id !== id));
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-4xl font-extrabold text-yellow-500 mb-6 text-center drop-shadow-sm tracking-tight">
        🧾 Customer Details
      </h1>

      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-sm font-semibold bg-yellow-400 text-black px-4 py-2 rounded-lg shadow-md hover:bg-yellow-500 hover:scale-90 transition-all duration-200 flex items-center gap-1"
      >
        ← Back to Customers
      </button>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : (
        <>
          <div className="bg-white shadow-md p-6 rounded-xl mb-6 border border-gray-200">
            <p className="mb-2 text-lg"><strong>Name:</strong> {customer?.name || name}</p>
            <p className="mb-2 text-lg"><strong>Email:</strong> {customer?.email || "N/A"}</p>
            <p className="mb-2 text-lg"><strong>Phone:</strong> {customer?.phone || "N/A"}</p>
            <p className="text-lg"><strong>Total Bills:</strong> {bills.length}</p>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-4">📄 Bill Details</h2>

          {bills.length === 0 ? (
            <p className="text-gray-500 italic">No bills found for this customer.</p>
          ) : (
            <ul className="space-y-4">
              {bills.map((bill) => (
                <li
                  key={bill._id}
                  className="bg-white border border-yellow-300 rounded-xl p-5 shadow hover:shadow-md transition duration-200 relative"
                >
                  <div className="space-y-1 text-sm text-gray-700">
                    <p><strong>Bill Number:</strong> {bill.billNumber}</p>
                    <p><strong>Date:</strong> {new Date(bill.billDate).toLocaleDateString()}</p>
                    <p><strong>Total Amount:</strong> ₹{bill.totalAmount.toFixed(2)}</p>
                    <p><strong>Status:</strong> <span className={`font-semibold ${bill.paymentStatus === "Paid" ? "text-green-600" : bill.paymentStatus === "Unpaid" ? "text-red-600" : "text-gray-600"}`}>{bill.paymentStatus}</span></p>
                    <p><strong>Payment Method:</strong> {bill.paymentMethod || "N/A"}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute bottom-3 right-3 flex gap-3">
                    <button
                      title="View Bill"
                      onClick={() => handleView(bill._id)}
                      className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition"
                    >
                      <Eye size={18} className="text-blue-600 hover:scale-110 transition-transform" />
                    </button>

                    <button
                      title="Delete Bill"
                      onClick={() => handleDelete(bill._id)}
                      className="p-2 rounded-full bg-red-100 hover:bg-red-200 transition"
                    >
                      <Trash size={18} className="text-red-600 hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default CustomerDetails;
