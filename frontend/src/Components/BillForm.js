import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { Autocomplete, TextField, } from '@mui/material';
import Swal from 'sweetalert2';


const BillForm = ({ onSuccess }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const prefilled = location.state?.selectedItems || [];

  const [billData, setBillData] = useState({
    billNumber: '',
    billDate: new Date().toISOString().slice(0, 10),
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    items: prefilled.length
      ? prefilled.map((it) => ({
        _id: it._id,
        itemName: it.name,
        quantity: it.quantity || 1,
        price: it.costPrice,
        salePrice: it.salePrice,
        commission: it.commission || 0, // ✅ Add this line
      }))
      : [
        {
          _id: "",                 // Can remain empty for empty initial state
          itemName: "",
          quantity: 1,
          price: 0,
          salePrice: 0,
        },
      ],
    tax: 0,
    discount: 0,
    totalAmount: 0,
    paymentStatus: 'Paid',
    paymentMethod: 'Cash',
    createdBy: localStorage.getItem('username') || 'N/A',
    billTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    agentName: '',
    commission: '0',
  });

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(
          "http://localhost:5000/api/bills/next-bill-number",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setBillData((prev) => ({ ...prev, billNumber: res.data.nextBillNumber }));
      } catch (err) {
        console.error("Failed fetching bill number:", err);
      }
    })();
  }, []);

  const [allCustomers, setAllCustomers] = useState([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userType = user?.userType;

        const endpoint =
          userType === "admin"
            ? "http://localhost:5000/api/bills/customers/list"
            : "http://localhost:5000/api/bills/customers/my";

        const res = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setAllCustomers(res.data.customers || []);
      } catch (err) {
        console.error("Error fetching customers:", err);
      } finally {
      }
    };

    fetchCustomers();
  }, []);

  const [availableItems, setAvailableItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const token = localStorage.getItem("token");
        const userType = localStorage.getItem("userType")?.toLowerCase();
        const route =
          userType === "admin"
            ? "http://localhost:5000/api/items/all"
            : "http://localhost:5000/api/items/my-items";

        const res = await axios.get(route, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setAvailableItems(res.data);  // Ensure this state exists
      } catch (err) {
        console.error("Failed to fetch items:", err);
      }
    };

    fetchItems();
  }, []);

  const [agents, setAgents] = useState([]);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/bills/agents", {
          params: {
            userType: localStorage.getItem("userType"),
            username: localStorage.getItem("username"),
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const validAgents = res.data.filter(
          (a) => a.agentName?.trim() !== ""
        );

        setAgents(validAgents);
      } catch (error) {
        console.error("❌ Failed to fetch agents", error);
      }
    };

    fetchAgents();
  }, []);

  // Auto-calculate average commission and cap at 10%
  useEffect(() => {
    const itemCommissions = billData.items
      .map((it) => Number(it.commission || 0))
      .filter((val) => !isNaN(val));

    const avg = itemCommissions.length
      ? itemCommissions.reduce((sum, val) => sum + val, 0) / itemCommissions.length
      : 0;

    const cappedAvg = Math.min(avg, 10); // Max 10%

    setBillData((prev) => ({
      ...prev,
      commissionPercent: Number(cappedAvg.toFixed(2)),
    }));
  }, [billData.items]);

  useEffect(() => {
    if (['Unpaid', 'Pending'].includes(billData.paymentStatus)) {
      setBillData((prev) => ({ ...prev, paymentMethod: 'N/A' }));
    }
  }, [billData.paymentStatus]);

  const handleItemChange = (index, field, value) => {
    const items = [...billData.items];
    const selectedItem = items[index];

    if (field === "quantity") {
      const available = availableItems.find((i) => i.name === selectedItem.itemName);

      if (available) {
        const enteredQty = Number(value);

        if (enteredQty > available.quantity) {
          setError(`❌ "${selectedItem.itemName}" has only ${available.quantity} in stock.`);
          return;
        }

        if (enteredQty < 1) {
          setError(`❌ Quantity must be at least 1.`);
          return;
        }
      }
    }

    // Only clear error if the value is valid
    setError('');
    items[index][field] = ['quantity', 'price', 'salePrice'].includes(field) ? Number(value) : value;
    setBillData((prev) => ({ ...prev, items }));
  };



  const addItem = () => setBillData((prev) => ({
    ...prev,
    items: [...prev.items, { itemName: '', quantity: 1, price: 0, salePrice: 0 }]
  }));

  const removeItem = (i) => setBillData((prev) => ({
    ...prev,
    items: prev.items.filter((_, idx) => idx !== i)
  }));

  const calculateTotals = () => {
    const subtotal = billData.items.reduce(
      (sum, it) => sum + it.quantity * it.salePrice,
      0
    );
    const taxAmount = (subtotal * billData.tax) / 100;
    const discountAmount = (subtotal * billData.discount) / 100;
    const totalAmount = subtotal + taxAmount - discountAmount;
    const commissionAmount = ((billData.commissionPercent || 0) / 100) * totalAmount;

    return { subtotal, taxAmount, discountAmount, totalAmount, commissionAmount };
  };

  // ✅ Now it's safe to use
  const totals = calculateTotals();

  const resetForm = async () => {
    setBillData((prev) => ({
      ...prev,
      billNumber: '',
      billDate: new Date().toISOString().slice(0, 10),
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      items: [{ itemName: '', quantity: 1, price: 0, salePrice: 0 }],
      tax: 0, discount: 0, totalAmount: 0,
      paymentStatus: 'Unpaid', paymentMethod: '',
      agentName: '', commission: 0
    }));
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        "http://localhost:5000/api/bills/next-bill-number",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBillData((prev) => ({ ...prev, billNumber: res.data.nextBillNumber }));
    } catch (err) {
      console.error("Failed new bill number:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    const { subtotal, taxAmount, discountAmount, totalAmount } = calculateTotals();

    if (!billData.customerName.trim()) {
      setError("Customer name is required");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...billData,
        subTotal: subtotal,
        taxAmount,
        discountAmount,
        totalAmount,
        commission: Number(billData.commission),
        createdBy: JSON.parse(localStorage.getItem("user") || "{}")._id || "N/A"
      };

      const res = await axios.post(
        "http://localhost:5000/api/bills",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (onSuccess) onSuccess(res.data.bill);

      const billId = res.data.bill?._id;

      // ✅ SweetAlert2 Prompt
      Swal.fire({
        title: "✅ Bill Saved!",
        text: "Do you want to view the bill now?",
        icon: "success",
        showCancelButton: true,
        confirmButtonText: "Yes, View Bill",
        cancelButtonText: "No, Stay Here",
        confirmButtonColor: "#000000",
        cancelButtonColor: "#facc15",
      }).then(async (result) => {
        if (result.isConfirmed && billId) {
          navigate(`/bill/${billId}`);
        } else {
          await resetForm();
          setSuccessMsg("✅ Bill created successfully!");
        }
      });

    } catch (err) {
      console.error("❌ Error while creating bill:", err);
      setError(err.response?.data?.msg || "Failed to create bill");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Create New Bill</h2>
      {error && <p className="mb-4 text-red-600">{error}</p>}
      {successMsg && <p className="mb-4 text-green-600">{successMsg}</p>}

      <form onSubmit={handleSubmit}>
        {/* Bill Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 p-3 rounded shadow-sm border">
            <p className="text-xs text-gray-600">Bill Number</p>
            <p className="text-sm font-semibold text-gray-800">{billData.billNumber}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded shadow-sm border">
            <p className="text-xs text-gray-600">Created By</p>
            <p className="text-sm font-semibold text-gray-800">{billData.createdBy}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded shadow-sm border">
            <p className="text-xs text-gray-600">Bill Date</p>
            <p className="text-sm font-semibold text-gray-800">{billData.billDate}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded shadow-sm border">
            <p className="text-xs text-gray-600">Bill Time</p>
            <p className="text-sm font-semibold text-gray-800">{billData.billTime}</p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700">Customer Name *</label>
          <Autocomplete
            freeSolo
            options={allCustomers.map((cust) => cust.name)}
            value={billData.customerName}
            onChange={(e, value) => {
              const selected = allCustomers.find((c) => c.name === value);
              if (selected) {
                setBillData((prev) => ({
                  ...prev,
                  customerName: selected.name,
                  customerEmail: selected.email || "",
                  customerPhone: selected.phone || "",
                }));
              } else {
                setBillData((prev) => ({
                  ...prev,
                  customerName: value || "",
                  customerEmail: "",
                  customerPhone: "",
                }));
              }
            }}
            onInputChange={(e, value) => {
              setBillData((prev) => ({
                ...prev,
                customerName: value,
                customerEmail: "",
                customerPhone: "",
              }));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search or Enter Customer Name *"
                required
                className="w-full"
              />
            )}
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700">Customer Phone</label>
          <input
            type="tel"
            value={billData.customerPhone}
            onChange={(e) =>
              setBillData((prev) => ({ ...prev, customerPhone: e.target.value }))
            }
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Enter phone if new customer"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700">Customer Email</label>
          <input
            type="email"
            value={billData.customerEmail}
            onChange={(e) =>
              setBillData((prev) => ({ ...prev, customerEmail: e.target.value }))
            }
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Enter email if new customer"
          />
        </div>


        {/* Payment Info */}
        <div className="mb-6">
          <label className="block mb-1 font-medium text-gray-700">Payment Status</label>
          <select value={billData.paymentStatus} onChange={(e) => setBillData(prev => ({ ...prev, paymentStatus: e.target.value }))} className="w-full p-2 border border-gray-300 rounded">
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        <div className="mb-6">
          <label className="block mb-1 font-medium text-gray-700">Payment Method</label>
          <select
            value={billData.paymentMethod}
            onChange={(e) => setBillData(prev => ({ ...prev, paymentMethod: e.target.value }))}
            disabled={billData.paymentStatus !== "Paid"}
            className={`w-full p-2 border border-gray-300 rounded ${billData.paymentStatus !== "Paid" ? "bg-gray-100 cursor-not-allowed" : ""}`}

          >
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
            <option value="N/A">N/A</option>
          </select>
        </div>

        <div className="mb-6 w-full">
          {/* Heading */}
          <h2 className="text-md font-semibold text-gray-700 mb-2">Item Info</h2>

          {billData.items.map((item, idx) => (
            <div key={idx} className="flex flex-wrap items-end gap-3 mb-3">

              {/* Item Name */}
              <div className="flex flex-col w-full md:w-1/3">
                <p className="text-[13px] text-gray-500 mb-1">Item Name</p>
                <Autocomplete
                  options={availableItems.map((item) => item.name)}
                  value={item.itemName}
                  onChange={(e, value) => {
                    const updatedItems = [...billData.items];
                    if (value === null) {
                      // Clear item if Autocomplete is cleared
                      updatedItems[idx] = {
                        ...updatedItems[idx],
                        itemName: '',
                        price: 0,
                        salePrice: 0,
                        quantity: 1,
                      };
                    } else {
                      const selected = availableItems.find((i) => i.name === value);
                      if (selected) {
                        updatedItems[idx] = {
                          ...updatedItems[idx],
                          _id: selected._id, // ✅ REQUIRED for backend to fetch and update stock
                          itemName: selected.name,
                          price: selected.costPrice,
                          salePrice: selected.salePrice,
                          quantity: 1,
                          commission: selected.commission || 0,
                        };
                      }
                    }
                    setBillData((prev) => ({ ...prev, items: updatedItems }));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select Item"
                      required
                      size="small"
                      className="w-full"
                      InputProps={{
                        ...params.InputProps,
                        sx: {
                          '& .MuiAutocomplete-endAdornment': {
                            top: '50%',
                            transform: 'translateY(-50%)',
                          },
                        },
                      }}
                    />
                  )}
                  noOptionsText="No item found"
                />
              </div>

              {/* Quantity */}
              <div className="flex flex-col w-20">
                <p className="text-[13px] text-gray-500 mb-1">Quantity</p>
                <input
                  type="number"
                  min="1"
                  step="1"
                  inputMode="numeric"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                  className="p-2 border border-gray-300 rounded text-sm"
                  required
                />
              </div>
              {/* Cost Price */}
              <div className="flex flex-col w-28">
                <p className="text-[13px] text-gray-500 mb-1">Cost Price</p>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="₹"
                  value={item.price}
                  readOnly
                  className="p-2 border border-gray-300 rounded text-sm bg-gray-100 cursor-not-allowed"
                />
              </div>

              {/* Sale Price */}
              <div className="flex flex-col w-28">
                <p className="text-[13px] text-gray-500 mb-1">Sale Price</p>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="₹"
                  value={item.salePrice}
                  readOnly
                  className="p-2 border border-gray-300 rounded text-sm bg-gray-100 cursor-not-allowed"
                />
              </div>
              {/* Commission */}
              <div className="flex flex-col w-28">
                <p className="text-[13px] text-gray-500 mb-1">Commission %</p>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.commission || 0}
                  readOnly
                  className="p-2 border border-gray-300 rounded text-sm bg-gray-100 cursor-not-allowed"
                />
              </div>
              {/* Remove Button */}
              {billData.items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="text-red-600 hover:text-red-800 font-bold text-xl"
                  title="Remove item"
                >×</button>
              )}
            </div>
          ))}

          {/* Add Item Button */}
          <button
            type="button"
            onClick={addItem}
            className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Add Item
          </button>
        </div>

        {/* Agent Info */}
        <div className="w-full mb-6">
          {/* Heading */}
          <h2 className="text-md font-semibold text-gray-700 mb-2">Agent Info</h2>

          {/* Agent Name and Commission Side by Side */}
          <div className="flex flex-col md:flex-row md:space-x-4">
            {/* Agent Name */}
            <div className="w-full md:w-1/2">
              <label className="block mb-1 text-[13px] text-gray-500">Agent Name</label>
              <Autocomplete
                options={agents.map((a) => a.agentName)}
                value={billData.agentName}
                onChange={(e, value) =>
                  setBillData((prev) => ({ ...prev, agentName: value }))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Type Agent Name"
                    variant="outlined"
                    size="small"
                    className="w-full"
                    InputProps={{
                      ...params.InputProps,
                      sx: {
                        '& .MuiAutocomplete-endAdornment': {
                          top: '50%',
                          transform: 'translateY(-50%)',
                        },
                      },
                    }}
                  />
                )}
                freeSolo
                noOptionsText="No agent found"
              />
            </div>

            {/* Commission */}
            <div className="w-full md:w-1/2">
              <label className="block mb-1 text-[13px] text-gray-500">Commission %</label>
              <input
                type="number"
                value={billData.commissionPercent || 0}
                readOnly
                className="p-2 border border-gray-300 rounded text-sm w-full bg-gray-100 cursor-not-allowed"
              />
            </div>
          </div>
        </div>


        {/* Tax / Discount */}
        <div className="mb-6 flex space-x-4">
          <div className="flex flex-col w-1/2">
            <p className="text-[13px] text-gray-500 mb-1">Tax %</p>
            <input
              type="number"
              min="0"
              max="100"
              placeholder="Tax %"
              value={billData.tax}
              onChange={(e) =>
                setBillData((prev) => ({ ...prev, tax: Number(e.target.value) }))
              }
              className="p-2 border border-gray-300 rounded text-sm"
            />
          </div>
          <div className="flex flex-col w-1/2">
            <p className="text-[13px] text-gray-500 mb-1">Discount %</p>
            <input
              type="number"
              min="0"
              max="100"
              placeholder="Discount %"
              value={billData.discount}
              onChange={(e) =>
                setBillData((prev) => ({ ...prev, discount: Number(e.target.value) }))
              }
              className="p-2 border border-gray-300 rounded text-sm"
            />
          </div>
        </div>

        {/* Totals */}
        <div className="mb-6 bg-gray-50 p-4 rounded border border-gray-200">
          <p className="text-gray-700">Subtotal: <strong>₹{totals.subtotal.toFixed(2)}</strong></p>
          <p className="text-gray-700">Tax: <strong>₹{totals.taxAmount.toFixed(2)}</strong></p>
          <p className="text-gray-700">Discount: <strong>₹{totals.discountAmount.toFixed(2)}</strong></p>
          {totals.commissionAmount > 0 && (
            <p className="text-sm text-green-600 mt-1">
              Agent Commission: ₹{totals.commissionAmount.toFixed(2)}
            </p>
          )}
          <p className="text-lg font-semibold text-gray-900">Total: ₹{totals.totalAmount.toFixed(2)}</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 text-white font-bold rounded ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-yellow-500 hover:bg-yellow-600"}`}
        >{loading ? "Saving..." : "Create Bill"}</button>
      </form>
    </div>
  );
};

export default BillForm;    
