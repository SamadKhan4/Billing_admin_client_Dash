import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

const ExchangedBills = () => {
  const [exchangeBills, setExchangeBills] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBillId, setSelectedBillId] = useState(null);
  const [userType, setUserType] = useState("");
  const [isLoadingUserType, setIsLoadingUserType] = useState(true);
  const navigate = useNavigate();

  const fetchExchangeBills = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/bills/exchanged", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.msg || "Failed to fetch exchange bills");
      setExchangeBills(data);
    } catch (error) {
      console.error("❌ Error fetching exchange bills:", error.message);
    }
  };

  useEffect(() => {
    const userTypeLocal = localStorage.getItem("userType");
    if (userTypeLocal) {
      setUserType(userTypeLocal);
    }
    setIsLoadingUserType(false);
    fetchExchangeBills();
  }, []);

  const handleDeleteClick = (billId) => {
    setSelectedBillId(billId);
    setOpenDialog(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/bills/${selectedBillId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.msg || "Failed to delete bill");

      // Remove deleted bill from UI
      setExchangeBills((prev) => prev.filter((bill) => bill._id !== selectedBillId));
    } catch (error) {
      console.error("❌ Delete failed:", error.message);
    } finally {
      setOpenDialog(false);
      setSelectedBillId(null);
    }
  };

  if (isLoadingUserType) return null; // wait for userType to load

  return (
    <div className="min-h-screen pt-6 px-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-6 text-center">📦 Exchange Bills</h1>

      {exchangeBills.length === 0 ? (
        <p className="text-gray-600 text-center">No exchange bills found yet.</p>
      ) : (
        <div className="bg-white p-4 rounded shadow-md max-w-4xl mx-auto">
          <table className="w-full table-auto border border-gray-300">
            <thead>
              <tr className="bg-gray-200 text-gray-800">
                <th className="p-2 border">#</th>
                <th className="p-2 border">Bill No.</th>
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Time</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {exchangeBills.map((bill, index) => (
                <tr key={bill._id} className="text-center hover:bg-gray-50">
                  <td className="border p-2">{index + 1}</td>
                  <td className="border p-2 font-semibold">{bill.billNumber}</td>
                  <td className="border p-2">
                    {new Date(bill.billDate).toLocaleDateString()}
                  </td>
                  <td className="border p-2">{bill.billTime}</td>
                  <td className="border p-2">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => navigate(`/exchanged-bill/${bill._id}`)}
                        className="text-blue-600 hover:text-blue-800"
                        title="View"
                      >
                        <Eye size={20} />
                      </button>

                      {userType?.toLowerCase() === "admin" && (
                        <button
                          onClick={() => handleDeleteClick(bill._id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>Are you sure you want to delete this bill?</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ExchangedBills;
