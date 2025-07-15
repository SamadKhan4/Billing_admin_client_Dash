import React, { useEffect, useState } from "react";
import axios from "axios";

const ViewAllProducts = () => {
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/items/all", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setItems(res.data);
      } catch (err) {
        console.error("Error fetching all items:", err);
      }
    };

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
        const newQty = Number(quantity);
        return {
          ...item,
          quantity: newQty > stock ? stock : newQty,
        };
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

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
      <h2 className="text-2xl font-bold mb-4">📦 All Products (Admin View)</h2>

      {items.length === 0 ? (
        <p>No items found.</p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const selected = selectedItems.find((i) => i._id === item._id);
            return (
              <div
                key={item._id}
                className="border rounded p-3 shadow-sm space-y-2"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p><strong>Name:</strong> {item.name}</p>
                    <p><strong>Cost Price:</strong> ₹{item.costPrice}</p>
                    <p><strong>Sale Price:</strong> ₹{item.salePrice}</p>
                    <p><strong>Stock:</strong> {item.stock}</p>
                    <p><strong>Created By:</strong> {item.createdBy}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={!!selected}
                    onChange={() => handleSelect(item)}
                  />
                </div>

                {selected && (
                  <div className="mt-2">
                    <label className="block mb-1 font-medium">Quantity:</label>
                    <input
                      type="number"
                      min="1"
                      max={item.stock}
                      value={selected.quantity}
                      onChange={(e) =>
                        handleQuantityChange(item._id, e.target.value, item.stock)
                      }
                      className="border px-2 py-1 rounded w-20"
                    />
                    {selected.quantity > item.stock && (
                      <p className="text-red-500 text-sm mt-1">
                        ❌ Out of stock (Max: {item.stock})
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selectedItems.length > 0 && (
        <div className="mt-6 p-4 border-t">
          <h3 className="text-xl font-semibold mb-2">🧾 Selected Items</h3>
          <ul className="list-disc ml-6 space-y-1">
            {selectedItems.map((item) => (
              <li key={item._id}>
                {item.name} — ₹{item.salePrice} × {item.quantity}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-lg font-bold">
            Total Price: ₹{calculateTotal()}
          </p>
        </div>
      )}
    </div>
  );
};

export default ViewAllProducts;
