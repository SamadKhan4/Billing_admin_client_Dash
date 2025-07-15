import React, { useEffect, useState } from "react";
import { Eye, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import UserTypeDropdown from "../Components/UserTypeDropdown";

const API_BASE = "http://localhost:5000";

const AllCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [sortOrder, setSortOrder] = useState("latest"); // latest | oldest
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/users/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch customers");
      const data = await res.json();

      const sortedData =
        sortOrder === "latest"
          ? [...data].reverse()
          : [...data]; // assuming backend returns oldest first
      setCustomers(sortedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [sortOrder]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this customer?");
    if (!confirmDelete) return;

    setDeletingId(id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.msg || "Failed to delete customer");
      }
      setCustomers((prev) => prev.filter((user) => user._id !== id));
    } catch (err) {
      alert("Error deleting customer: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <p>Loading customers...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <UserTypeDropdown current="Customers" /> 
      <h1 className="text-2xl font-bold mb-6 text-yellow-600">All Customers</h1>
      <table className="min-w-full border border-gray-300 rounded-lg">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">Username</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Phone</th>
            <th className="border px-4 py-2">Joined</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((user) => (
            <tr key={user._id} className="hover:bg-yellow-50">
              <td className="border px-4 py-2">{user.username}</td>
              <td className="border px-4 py-2">{user.email}</td>
              <td className="border px-4 py-2">{user.phone}</td>
              <td className="border px-4 py-2">
                {new Date(user.createdAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </td>
              <td className="border px-4 py-2 flex justify-center items-center gap-4">
                <button
                  onClick={() =>
                    navigate("/user-details", {
                      state: {
                        user: {
                          ...user,
                          registeredAt: user.createdAt,
                        },
                      },
                    })
                  }
                  className="text-blue-600 hover:text-blue-800 transition-transform transform hover:scale-110"
                  title="View Details"
                >
                  <Eye size={22} />
                </button>
                <button
                  onClick={() => handleDelete(user._id)}
                  disabled={deletingId === user._id}
                  title="Delete Customer"
                  className={`text-red-600 hover:text-red-800 transition-transform transform hover:scale-110 ${
                    deletingId === user._id ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <Trash2 size={22} />
                </button>
              </td>
            </tr>
          ))}
          {customers.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center p-4">
                No customers found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AllCustomers;
