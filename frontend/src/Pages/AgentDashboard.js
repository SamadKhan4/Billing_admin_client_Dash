import React, { useEffect, useState } from "react";
import {
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const AgentDashboard = () => {
  const [totalBills, setTotalBills] = useState(0);
  const [totalCommission, setTotalCommission] = useState(0);
  const [lastBillDate, setLastBillDate] = useState(null);
  const [loading, setLoading] = useState(true);

  const agentName = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchAgentStats = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/bills/agent-summary/${agentName}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          setTotalBills(data.totalBills);
          setTotalCommission(data.totalCommission);
          setLastBillDate(data.lastBillDate);
        }
      } catch (err) {
        console.error("Failed to fetch agent stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgentStats();
  }, [agentName, token]);

  const Card = ({ icon, title, value, color }) => (
    <Paper elevation={4} sx={{ p: 3, display: "flex", alignItems: "center" }}>
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
        <Typography mt={2}>Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h5" mb={3}>
        👨‍💼 Agent Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card
            icon={<ReceiptLongIcon fontSize="large" />}
            title="Total Bills Assisted"
            value={totalBills}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            icon={<MonetizationOnIcon fontSize="large" />}
            title="Total Commission Earned"
            value={`₹ ${totalCommission}`}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            icon={<AccessTimeIcon fontSize="large" />}
            title="Last Bill Activity"
            value={lastBillDate ? new Date(lastBillDate).toLocaleDateString() : "No Data"}
            color="#f57c00"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AgentDashboard;
