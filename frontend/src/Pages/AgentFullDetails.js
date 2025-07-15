import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    Paper,
    CircularProgress,
    Grid,
    IconButton,
    Tooltip,
} from "@mui/material";
import axios from "axios";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";

const AgentFullDetails = () => {
    const { name } = useParams();
    const navigate = useNavigate();
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const userType = localStorage.getItem("userType");
    const username = localStorage.getItem("username");
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchAgentBills = async () => {
            try {
                const res = await axios.get(
                    `http://localhost:5000/api/bills/agent-bills/${encodeURIComponent(name)}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                        params: { userType, username },
                    }
                );
                setBills(res.data);
            } catch (err) {
                console.error("❌ Error fetching agent bills:", err);
                setError("Failed to load agent details.");
            } finally {
                setLoading(false);
            }
        };

        fetchAgentBills();
    }, [name, userType, username, token]);

    const handleDelete = async (billId) => {
        const confirm = window.confirm("Are you sure you want to delete this bill?");
        if (!confirm) return;

        try {
            await axios.delete(`http://localhost:5000/api/bills/delete-bill/${billId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setBills((prev) => prev.filter((bill) => bill._id !== billId));
            alert("✅ Bill deleted successfully.");
        } catch (err) {
            console.error("❌ Failed to delete bill:", err);
            alert("❌ Failed to delete bill.");
        }
    };

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;

    const filteredBills = bills.filter((bill) => Number(bill.commission) > 0);
    const totalCommission = filteredBills.reduce(
        (acc, bill) => acc + Number(bill.commission),
        0
    );
    const createdBy = filteredBills[0]?.createdBy || "N/A";
    const billNumbers =
        filteredBills.length > 0
            ? filteredBills.map((b) => b.billNumber).join(", ")
            : "None";

    return (
        <Box p={4}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
                Agent Full Details
            </Typography>

            {/* Summary Info */}
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                    <strong>Bill Numbers:</strong> {billNumbers}
                </Typography>
                <Typography variant="subtitle1">
                    <strong>Agent Name:</strong> {name}
                </Typography>
                <Typography variant="subtitle1">
                    <strong>Total Bills:</strong> {filteredBills.length}
                </Typography>
                <Typography variant="subtitle1">
                    <strong>Total Commission:</strong> ₹ {totalCommission.toFixed(2)}
                </Typography>
            </Paper>

            {/* Bill List */}
            <Typography variant="h6" gutterBottom>
                Bill Details:
            </Typography>

            {filteredBills.length === 0 ? (
                <Typography>No commission-based bills found for this agent.</Typography>
            ) : (
                <Grid container spacing={2}>
                    {filteredBills.map((bill, idx) => (
                        <Grid item xs={12} md={6} key={idx}>
                            <Paper sx={{ p: 2, position: "relative" }}>
                                <Typography>
                                    <strong>Bill Number:</strong> {bill.billNumber}
                                </Typography>
                                <Typography>
                                    <strong>Customer:</strong> {bill.customerName}
                                </Typography>
                                <Typography>
                                    <strong>Bill Date:</strong> {new Date(bill.billDate).toLocaleDateString()}
                                </Typography>
                                <Typography>
                                    <strong>Payment Status:</strong> {bill.paymentStatus}
                                </Typography>
                                <Typography>
                                    <strong>Total Amount:</strong> ₹ {bill.totalAmount}
                                </Typography>
                                <Typography>
                                    <strong>Commission:</strong> ₹ {bill.commission || 0}
                                </Typography>

                                <Box mt={1}>
                                    <Tooltip title="View Bill">
                                        <IconButton
                                            color="primary"
                                            onClick={() => navigate(`/bill/${bill._id}`)}
                                        >
                                            <VisibilityIcon />
                                        </IconButton>
                                    </Tooltip>

                                    {userType === "Admin" && (
                                        <Tooltip title="Delete Bill">
                                            <IconButton
                                                color="error"
                                                onClick={() => handleDelete(bill._id)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default AgentFullDetails;
