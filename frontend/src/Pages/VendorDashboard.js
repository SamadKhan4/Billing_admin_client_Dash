import React, { useEffect, useState } from "react";
import {
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

const VendorDashboard = () => {
  const [totalItems, setTotalItems] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [topProduct, setTopProduct] = useState("N/A");
  const [loading, setLoading] = useState(true);

  const vendorName = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchVendorSummary = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/items/vendor-summary/${vendorName}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (res.ok) {
          setTotalItems(data.totalItems || 0);
          setTotalSales(data.totalSales || 0);
          setTopProduct(data.topProduct || "N/A");
        } else {
          console.error("❌ Vendor summary fetch failed");
        }
      } catch (err) {
        console.error("❌ Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVendorSummary();
  }, [vendorName, token]);

  const StatCard = ({ title, value, icon, color }) => (
    <Paper elevation={3} sx={{ p: 3, display: "flex", alignItems: "center" }}>
      <Box sx={{ mr: 2, color }}>{icon}</Box>
      <Box>
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h6">{value}</Typography>
      </Box>
    </Paper>
  );

  if (loading) {
    return (
      <Box textAlign="center" mt={5}>
        <CircularProgress />
        <Typography mt={2}>Loading Vendor Dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h5" mb={3}>
        🏭 Vendor Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Total Items Supplied"
            value={totalItems}
            icon={<Inventory2Icon fontSize="large" />}
            color="#1565c0"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Total Sales (₹)"
            value={`₹ ${totalSales}`}
            icon={<CurrencyRupeeIcon fontSize="large" />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Top Selling Product"
            value={topProduct}
            icon={<EmojiEventsIcon fontSize="large" />}
            color="#ff6f00"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default VendorDashboard;
