import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Tooltip from '@mui/material/Tooltip';
import { Autocomplete, TextField } from "@mui/material";

const ViewProducts = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [showStockDetails, setShowStockDetails] = useState(false);
  const [userType, setUserType] = useState("");

  const navigate = useNavigate();

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem("token");
      const type = localStorage.getItem("userType")?.toLowerCase();
      setUserType(type);

      const route =
        type === "admin"
          ? "http://localhost:5000/api/items/all"
          : "http://localhost:5000/api/items/my-items";

      const res = await axios.get(route, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (Array.isArray(res.data)) {
        setItems(res.data);
        setFilteredItems(res.data);
      }
    } catch (err) {
      console.error("Error fetching items:", err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSelect = (item) => {
    const already = selectedItems.find((i) => i._id === item._id);
    if (already) {
      setSelectedItems(selectedItems.filter((i) => i._id !== item._id));
    } else {
      setSelectedItems([...selectedItems, { ...item, quantity: 1 }]);
    }
  };

  const handleQuantityChange = (itemId, quantity, stock) => {
    const updated = selectedItems.map((item) => {
      if (item._id === itemId) {
        let newQty = Number(quantity);
        if (isNaN(newQty) || newQty < 1) newQty = 1;
        if (newQty > stock) newQty = stock;

        return { ...item, quantity: newQty };
      }
      return item;
    });

    setSelectedItems(updated);
  };

  const calculateTotal = () =>
    selectedItems.reduce(
      (sum, item) => sum + (Number(item.salePrice || 0) * item.quantity),
      0
    );

  const goToBill = () => {
    navigate("/bill-form", {
      state: {
        selectedItems: selectedItems.map((item) => ({
          _id: item._id,
          name: item.name,
          costPrice: item.costPrice,
          salePrice: item.salePrice,
          quantity: item.quantity || 1,
          stock: item.stock,
          commission: item.commission,
        })),
      },
    });
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this item?");
    if (!confirm) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/items/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchItems();
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const handleUpdate = (item) => {
    navigate("/add-items", { state: { itemToUpdate: item } });
  };

  const handleSearchChange = (e, newValue) => {
    setSearchValue(newValue);
    if (!newValue) {
      setFilteredItems(items);
    } else {
      const filtered = items.filter(item =>
        item.name.toLowerCase().includes(newValue.toLowerCase())
      );
      setFilteredItems(filtered);
    }
  };

  const lowStockItems = items.filter(item => item.stock <= 5);

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6 relative">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h2 className="text-3xl font-bold text-black">📦 All Products</h2>

        {lowStockItems.length > 0 && (
          <div
            onClick={() => setShowStockDetails(!showStockDetails)}
            className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-md font-medium shadow-md border border-yellow-300 cursor-pointer transition hover:bg-yellow-200"
          >
            🔔 You have {lowStockItems.length} stock notification
            {lowStockItems.length > 1 ? "s" : ""}
            {showStockDetails && (
              <ul className="mt-2 list-disc list-inside text-sm text-black">
                {lowStockItems.map((item) => (
                  <li
                    key={item._id}
                    onClick={() => {
                      const el = document.getElementById(`product-${item._id}`);
                      if (el) {
                        el.scrollIntoView({ behavior: "smooth", block: "start" });
                        el.classList.add("ring-2", "ring-red-500");
                        setTimeout(() => el.classList.remove("ring-2", "ring-red-500"), 1500);
                      }
                    }}
                    className="cursor-pointer underline hover:text-red-700"
                  >
                    {item.name} ({item.stock})
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <Autocomplete
          options={items.map(item => item.name)}
          value={searchValue}
          onInputChange={handleSearchChange}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search product"
              size="small"
              variant="outlined"
              sx={{ minWidth: 250 }}
            />
          )}
        />
      </div>

      {filteredItems.length === 0 ? (
        <p className="text-red-500 font-semibold">❌ Product not found.</p>
      ) : (
        <div className="space-y-6">
          {filteredItems.map((item) => {
            const selected = selectedItems.find((i) => i._id === item._id);
            return (
              <div
                key={item._id}
                id={`product-${item._id}`}
                className="border border-gray-300 rounded-xl p-4 shadow-sm relative bg-yellow-50"
              >
                <div className="flex justify-between items-start gap-4 flex-wrap">
                  <div className="flex-1">
                    <p><strong>Name:</strong> {item.name}</p>
                    <p><strong>Cost Price:</strong> ₹{item.costPrice}</p>
                    <p><strong>Sale Price:</strong> ₹{item.salePrice}</p>
                    <p><strong>Available Stock:</strong> {item.stock}</p>
                    <p><strong>Category:</strong> {item.category || "N/A"}</p>
                    <p><strong>Commission:</strong> {item.commission || 0}%</p>
                    {item.stock <= 5 && (
                      <p className="text-red-600 font-semibold text-sm mt-1">
                        ⚠️ Only {item.stock} in stock. Please refill soon!
                      </p>
                    )}
                    <p><strong>Created By:</strong> {item.createdBy}</p>
                  </div>

                  <div className="flex flex-col items-end space-y-2">
                    <img
                      src={`http://localhost:5000/uploads/${item.image}`}
                      alt={item.name}
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                  </div>
                </div>

                {userType === "editor" && selected && (
                  <div className="mt-3">
                    <label className="block mb-1 font-medium text-sm">Quantity:</label>
                    <input
                      type="number"
                      min="1"
                      max={item.stock}
                      value={selected.quantity}
                      onChange={(e) => {
                        const value = e.target.value;
                        handleQuantityChange(item._id, value === "" ? 1 : value, item.stock);
                      }}
                      className="border px-3 py-1 rounded w-24 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                    <p className="text-xs mt-1 text-gray-500">
                      Remaining after bill: {item.stock - selected.quantity}
                    </p>
                  </div>
                )}

                <div className="flex flex-col items-end space-y-2">
                  {userType === "editor" && (
                    <button
                      onClick={() => handleSelect(item)}
                      className={`px-4 py-1 rounded-lg font-semibold border transition ${selected
                        ? "bg-black text-yellow-300 border-black hover:bg-yellow-300 hover:text-black"
                        : "bg-yellow-400 text-black border-yellow-400 hover:bg-yellow-500"
                      }`}
                    >
                      {selected ? "Remove" : "Add"}
                    </button>
                  )}

                  <div className="flex space-x-4">
                    <Tooltip title="Edit">
                      <EditIcon
                        className="text-black cursor-pointer hover:text-yellow-600 transition"
                        onClick={() => handleUpdate(item)}
                      />
                    </Tooltip>
                    <Tooltip title="Delete">
                      <DeleteIcon
                        className="text-red-600 cursor-pointer hover:text-red-800 transition"
                        onClick={() => handleDelete(item._id)}
                      />
                    </Tooltip>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {userType === "editor" && selectedItems.length > 0 && (
        <div className="mt-10 p-4 bg-yellow-50 border-t shadow-inner rounded-lg sticky bottom-0 z-40">
          <div className="max-w-5xl mx-auto">
            <h3 className="text-lg font-bold text-black mb-2">🧾 Selected Items</h3>
            <ul className="list-disc ml-5 space-y-1 text-sm max-h-32 overflow-y-auto pr-2 text-black">
              {selectedItems.map((item) => (
                <li key={item._id}>
                  {item.name} — ₹{item.salePrice} × {item.quantity}
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-base font-bold text-black">
                Total: ₹{calculateTotal()}
              </p>
              <button
                onClick={goToBill}
                className="bg-black text-yellow-300 px-4 py-2 rounded-lg hover:bg-yellow-400 hover:text-black transition"
              >
                Go for a Bill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewProducts;
