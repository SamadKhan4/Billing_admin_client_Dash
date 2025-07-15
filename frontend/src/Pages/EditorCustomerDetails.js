import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000";

const EditorCustomerDetails = () => {
  const { name } = useParams();
  const navigate = useNavigate();

  const [bills, setBills] = useState([]);
  const [customer, setCustomer] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [exchangeCount, setExchangeCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const billsPerPage = 5;
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchCustomerBills = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/bills/customer/my/${encodeURIComponent(name)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch customer bills");

        const data = await res.json();
        setBills(data.bills || []);
        setCustomer(data.customer || {});
        const exchange = data.bills?.filter(
          (bill) => bill.exchangeFrom && bill.createdBy === userId
        ).length || 0;
        setExchangeCount(exchange);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerBills();
  }, [name, token, userId]);

  const filteredBills = bills.filter((bill) => {
    if (filter === "Exchange") {
      return bill.exchangeFrom && bill.createdBy === userId;
    }
    if (filter === "Paid") return bill.paymentStatus === "Paid";
    if (filter === "Unpaid") return bill.paymentStatus === "Unpaid";
    if (filter === "Pending") return bill.paymentStatus === "Pending";
    return true;
  });

  const totalPages = Math.ceil(filteredBills.length / billsPerPage);
  const paginatedBills = filteredBills.slice(
    (currentPage - 1) * billsPerPage,
    currentPage * billsPerPage
  );

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-yellow-500 mb-6 text-center drop-shadow">
        🧾 Customer Details
      </h1>

      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-sm font-semibold bg-yellow-400 text-black px-4 py-2 rounded-lg shadow-md hover:bg-yellow-500 hover:scale-105 transition-all duration-200 flex items-center gap-1"
      >
        ← Back to Customers
      </button>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : (
        <>
          <div className="bg-white shadow-lg p-6 rounded-xl mb-6 border border-yellow-200">
            <p className="mb-2 text-gray-800">
              <strong className="text-gray-600">Name:</strong> {customer?.name || name}
            </p>
            <p className="mb-2 text-gray-800">
              <strong className="text-gray-600">Email:</strong> {customer?.email || "N/A"}
            </p>
            <p className="mb-2 text-gray-800">
              <strong className="text-gray-600">Phone:</strong> {customer?.phone || "N/A"}
            </p>
            <p className="mb-2 text-gray-800">
              <strong className="text-gray-600">Total Bills:</strong> {bills.length}
            </p>
            <p className="mb-2 text-gray-800">
              <strong className="text-gray-600">Exchange Bills:</strong> {exchangeCount}
            </p>
          </div>

          <h2 className="text-2xl font-semibold mb-4 text-yellow-600">📄 Bill Details</h2>

          <div className="mb-5 flex flex-wrap gap-2">
            {["All", "Paid", "Unpaid", "Pending"].map((type) => (
              <button
                key={type}
                onClick={() => {
                  setFilter(type);
                  setCurrentPage(1); // reset to page 1 on filter change
                }}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium border ${
                  filter === type
                    ? "bg-yellow-500 text-white border-yellow-600"
                    : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-yellow-100"
                } transition-all`}
              >
                {type}
              </button>
            ))}
          </div>

          {filteredBills.length === 0 ? (
            <p className="text-gray-500 italic">No bills found for selected filter.</p>
          ) : (
            <>
              <ul className="space-y-4">
                {paginatedBills.map((bill) => (
                  <li
                    key={bill._id}
                    className="bg-white border border-yellow-200 rounded-xl p-5 shadow-sm relative transition-transform hover:scale-[1.01]"
                  >
                    <p className="text-gray-800">
                      <strong className="text-gray-600">Bill Number:</strong> {bill.billNumber}
                    </p>
                    <p className="text-gray-800">
                      <strong className="text-gray-600">Date:</strong>{" "}
                      {new Date(bill.billDate).toLocaleDateString()}
                    </p>
                    <p className="text-gray-800">
                      <strong className="text-gray-600">Total Amount:</strong> ₹
                      {bill.totalAmount.toFixed(2)}
                    </p>
                    <p className="text-gray-800">
                      <strong className="text-gray-600">Status:</strong> {bill.paymentStatus}
                    </p>
                    <p className="text-gray-800">
                      <strong className="text-gray-600">Payment Method:</strong>{" "}
                      {bill.paymentMethod || "N/A"}
                    </p>

                    <div className="absolute bottom-3 right-3">
                      <button
                        onClick={() => navigate(`/bill/${bill._id}`)}
                        className="px-4 py-1.5 text-sm font-medium bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-all"
                      >
                        View Bill
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Pagination Controls */}
              <div className="flex justify-center items-center gap-4 mt-6">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-yellow-400 text-black rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="font-semibold text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-yellow-400 text-black rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default EditorCustomerDetails;
