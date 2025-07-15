import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  TextField,
  Button,
  Paper,
  Typography,
  Box,
  MenuItem,
  Autocomplete,
  Grid,
} from "@mui/material";

const Exchange = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [billItems, setBillItems] = useState([]);
  const [billInfo, setBillInfo] = useState({});
  const [selectedItems, setSelectedItems] = useState([]);
  const [exchangeData, setExchangeData] = useState({});
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reasonOptions = [
    "Wrong size",
    "Received damaged item",
    "Color mismatch",
    "Wrong product",
    "Need different variant",
    "Any other reason",
  ];

  const userType = localStorage.getItem("userType")?.toLowerCase();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        const endpoint =
          userType === "admin"
            ? "http://localhost:5000/api/items/all"
            : "http://localhost:5000/api/items/my-items";
        const res = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch products:", err);
      }
    };

    const fetchBillItems = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:5000/api/bills/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBillItems(res.data.items || []);
        setBillInfo({
          billNumber: res.data.billNumber,
          customerName: res.data.customerName,
        });
      } catch (err) {
        console.error("❌ Failed to fetch bill items:", err);
      }
    };

    fetchProducts();
    fetchBillItems();
  }, [userType, id]);

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");

    const payload = selectedItems.map((idx) => {
      const form = exchangeData[idx];
      const reason = form.reason === "Any other reason" ? form.customReason : form.reason;

      return {
        originalItem: billItems[idx],
        newItemName: form.newItem,
        quantity: Number(form.quantity),
        reason,
      };
    });

    if (payload.some((p) => !p.newItemName || !p.reason)) {
      alert("Please fill all details for selected items.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await axios.post(
        "http://localhost:5000/api/exchange-request",
        { billId: id, items: payload },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("✅ Exchange processed.");
      setTimeout(() => {
        navigate(`/exchanged-bill/${res.data.newBill._id}`);
      }, 1000);
    } catch (err) {
      console.error("❌ Exchange failed:", err);
      setMessage("❌ Exchange failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper sx={{ maxWidth: 800, m: "50px auto", p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Exchange Request
      </Typography>

      <Box mb={3}>
        <Typography variant="subtitle1"><strong>Bill Number:</strong> {billInfo.billNumber}</Typography>
        <Typography variant="subtitle1"><strong>Customer Name:</strong> {billInfo.customerName}</Typography>
      </Box>

      {billItems.map((item, idx) => {
        const isChecked = selectedItems.includes(idx);
        const itemForm = exchangeData[idx] || {
          reason: "",
          customReason: "",
          newItem: "",
          quantity: item.quantity,
          confirmationChecked: false,
        };

        const matchedProduct = products.find(p => p.name === itemForm.newItem);
        const newPrice = matchedProduct?.salePrice || 0;

        const originalTotal = item.salePrice * item.quantity;
        const newTotal = itemForm.quantity * newPrice;
        const priceDiff = newTotal - originalTotal;

        return (
          <Box key={idx} mb={3} p={2} border="1px solid #ccc" borderRadius={2}>
            <label>
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => {
                  const updated = isChecked
                    ? selectedItems.filter(i => i !== idx)
                    : [...selectedItems, idx];
                  setSelectedItems(updated);

                  if (!exchangeData[idx]) {
                    setExchangeData(prev => ({ ...prev, [idx]: itemForm }));
                  }
                }}
              />
              &nbsp;<strong>{item.itemName || item.name}</strong>
            </label>

            {isChecked && (
              <>
                <TextField
                  select
                  fullWidth
                  label="Reason"
                  value={itemForm.reason}
                  onChange={(e) =>
                    setExchangeData((prev) => ({
                      ...prev,
                      [idx]: { ...itemForm, reason: e.target.value },
                    }))
                  }
                  sx={{ mt: 2 }}
                >
                  {reasonOptions.map((option) => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </TextField>

                {itemForm.reason === "Any other reason" && (
                  <TextField
                    fullWidth
                    label="Please specify"
                    multiline
                    rows={2}
                    value={itemForm.customReason}
                    onChange={(e) =>
                      setExchangeData((prev) => ({
                        ...prev,
                        [idx]: { ...itemForm, customReason: e.target.value },
                      }))
                    }
                    sx={{ mt: 2 }}
                  />
                )}

                <Autocomplete
                  options={products.map(p => p.name)}
                  value={itemForm.newItem}
                  onChange={(e, newVal) =>
                    setExchangeData((prev) => ({
                      ...prev,
                      [idx]: { ...itemForm, newItem: newVal },
                    }))
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Select New Item" sx={{ mt: 2 }} />
                  )}
                  freeSolo
                />

                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <TextField
                      type="number"
                      label="Quantity"
                      value={itemForm.quantity}
                      onChange={(e) =>
                        setExchangeData((prev) => ({
                          ...prev,
                          [idx]: { ...itemForm, quantity: e.target.value },
                        }))
                      }
                      inputProps={{ min: 1 }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="New Item Price"
                      value={`₹${newPrice}`}
                      InputProps={{ readOnly: true }}
                      fullWidth
                    />
                  </Grid>
                </Grid>

                <Box mt={1} p={2} border="1px dashed #aaa" borderRadius={2}>
                  <Typography>Original: ₹{originalTotal}</Typography>
                  <Typography>New: ₹{newTotal}</Typography>
                  <Typography color={priceDiff > 0 ? "red" : "green"}>
                    Difference: ₹{priceDiff}
                  </Typography>

                  {priceDiff !== 0 && (
                    <label>
                      <input
                        type="checkbox"
                        checked={itemForm.confirmationChecked}
                        onChange={() =>
                          setExchangeData((prev) => ({
                            ...prev,
                            [idx]: {
                              ...itemForm,
                              confirmationChecked: !itemForm.confirmationChecked,
                            },
                          }))
                        }
                      />
                      &nbsp;
                      {priceDiff > 0
                        ? `Extra ₹${priceDiff} paid?`
                        : `Refund ₹${Math.abs(priceDiff)} done?`}
                    </label>
                  )}
                </Box>
              </>
            )}
          </Box>
        );
      })}

      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        disabled={isSubmitting || selectedItems.length === 0}
      >
        {isSubmitting ? "Processing..." : "Submit Exchange Request"}
      </Button>

      {message && (
        <Typography mt={2} color={message.includes("success") ? "green" : "error"}>
          {message}
        </Typography>
      )}
    </Paper>
  );
};

export default Exchange;
