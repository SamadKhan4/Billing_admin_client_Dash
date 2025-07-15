import React, { useEffect, useState } from "react";
import { Eye, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import UserTypeDropdown from "../Components/UserTypeDropdown"; // ✅ Import

const API_BASE = "http://localhost:5000";

const TotalEditors = () => {
  const [editors, setEditors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  const fetchEditors = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/users/editors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch editors");
      const data = await res.json();
      setEditors(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEditors();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this editor?");
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
      if (!res.ok) throw new Error("Failed to delete editor");
      setEditors((prev) => prev.filter((editor) => editor._id !== id));
    } catch (err) {
      alert("Error deleting editor: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <p>Loading editors...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <UserTypeDropdown current="Editors" /> {/* ✅ Common dropdown */}

      <h1 className="text-2xl font-bold mb-6">All Editors</h1>

      <table className="min-w-full border border-gray-300 rounded-lg">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">Username</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">User Type</th>
            <th className="border px-4 py-2">Joining Date</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {editors.map((editor) => (
            <tr key={editor._id} className="hover:bg-yellow-50">
              <td className="border px-4 py-2">{editor.username}</td>
              <td className="border px-4 py-2">{editor.email}</td>
              <td className="border px-4 py-2">{editor.userType}</td>
              <td className="border px-4 py-2">
                {new Date(editor.createdAt).toLocaleDateString()}
              </td>
              <td className="border px-4 py-2 flex justify-center gap-4">
                <button
                  onClick={() =>
                    navigate("/user-details", {
                      state: {
                        user: { ...editor, registeredAt: editor.createdAt },
                      },
                    })
                  }
                  className="text-blue-600 hover:text-blue-800 hover:scale-110 transition-transform"
                  title="View Details"
                >
                  <Eye size={22} />
                </button>
                <button
                  onClick={() => handleDelete(editor._id)}
                  disabled={deletingId === editor._id}
                  title="Delete"
                  className={`text-red-600 hover:text-red-800 hover:scale-110 transition-transform ${
                    deletingId === editor._id ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <Trash2 size={22} />
                </button>
              </td>
            </tr>
          ))}
          {editors.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center p-4">
                No editors found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TotalEditors;
