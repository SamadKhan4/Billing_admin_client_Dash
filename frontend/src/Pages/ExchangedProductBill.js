import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Grid,
  Button,
} from "@mui/material";

const ExchangedProductBill = () => {
  const { id } = useParams(); // get bill ID from URL
  const navigate = useNavigate();
  const [newBill, setNewBill] = useState(null);

  useEffect(() => {
    const fetchBill = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5000/api/bills/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.msg || "Bill not found");
        setNewBill(data);
      } catch (err) {
        console.error("❌ Failed to load bill:", err);
      }
    };

    fetchBill();
  }, [id]);

  if (!newBill) return <Typography>⚠️ Loading exchange bill...</Typography>;

  const exchangeInfo = newBill?.exchanges?.[0];
  const priceDiff = exchangeInfo?.difference || 0;

  return (
    <Box p={3}>
      <Paper elevation={4} sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h5" gutterBottom align="center" fontWeight={600}>
          🧾 Exchanged Product Bill
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography><strong>Customer:</strong> {newBill.customerName}</Typography>
            <Typography><strong>Phone:</strong> {newBill.customerPhone}</Typography>
            <Typography><strong>Email:</strong> {newBill.customerEmail}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography><strong>Bill Number:</strong> {newBill.billNumber}</Typography>
            <Typography><strong>Date:</strong> {new Date(newBill.billDate).toLocaleDateString()}</Typography>
            <Typography><strong>Time:</strong> {newBill.billTime}</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          🔁 Exchange Details
        </Typography>
        <Box sx={{ p: 2, backgroundColor: "#f1f1f1", borderRadius: 2 }}>
          <Typography><strong>Old Product:</strong> {exchangeInfo.oldItem}</Typography>
          <Typography><strong>Old Product Price:</strong> ₹{exchangeInfo.oldItemPrice}</Typography>
          <Typography><strong>New Product:</strong> {exchangeInfo.newItem}</Typography>
          <Typography><strong>New Product Price:</strong> ₹{exchangeInfo.newItemPrice}</Typography>
          <Typography><strong>Quantity:</strong> {exchangeInfo.quantity}</Typography>
          <Typography><strong>Reason:</strong> {exchangeInfo.reason}</Typography>
          <Typography><strong>Price Difference:</strong> ₹{priceDiff}</Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6">💳 Payment Info</Typography>
        <Typography>Payment Method: {newBill.paymentMethod}</Typography>
        <Typography>Total Amount: ₹{newBill.totalAmount}</Typography>

        {/* ✅ CONDITIONAL DIFFERENCE MESSAGE */}
        {priceDiff !== 0 && (
          <Typography sx={{ mt: 1 }} fontWeight={500} color={priceDiff > 0 ? "green" : "red"}>
            Price difference of ₹{Math.abs(priceDiff)} {priceDiff > 0 ? "is paid by customer" : "is refunded to customer"}.
          </Typography>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography align="center" color="green" fontWeight={600}>
          ✅ Exchange Completed Successfully.
        </Typography>

        <Box textAlign="center" mt={3}>
          <Button variant="contained" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ExchangedProductBill;
