import React, { useEffect, useState } from "react";
import {
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";

const cardStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: 2,
  borderRadius: 3,
  height: 120,
  background: "#f5f5f5",
};

const iconStyle = {
  fontSize: 50,
  color: "#1976d2",
};

const CustomerDashboard = () => {
  const [totalBills, setTotalBills] = useState(null);
  const [totalOrders, setTotalOrders] = useState(null);
  const [totalAmount, setTotalAmount] = useState(null);

  useEffect(() => {
    const fetchCustomerStats = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:5000/api/bills/customer-stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (res.ok) {
          setTotalBills(data.totalBills);
          setTotalOrders(data.totalOrders);
          setTotalAmount(data.totalAmountSpent);
        }
      } catch (error) {
        console.error("Failed to load customer stats:", error);
      }
    };

    fetchCustomerStats();
  }, []);

  const renderCard = (title, value, IconComponent) => (
    <Paper elevation={3} sx={cardStyle}>
      <Box>
        <Typography variant="subtitle2" color="textSecondary">
          {title}
        </Typography>
        <Typography variant="h5">
          {value !== null ? value : 0}
        </Typography>
      </Box>
      <IconComponent sx={iconStyle} />
    </Paper>
  );

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Welcome to Customer Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          {renderCard("Total Bills", totalBills, ReceiptLongIcon)}
        </Grid>
        <Grid item xs={12} md={4}>
          {renderCard("My Orders", totalOrders, ShoppingCartIcon)}
        </Grid>
        <Grid item xs={12} md={4}>
          {renderCard("Total Amount Spent", `₹${totalAmount}`, MonetizationOnIcon)}
        </Grid>
      </Grid>
    </Box>
  );
};

export default CustomerDashboard;
