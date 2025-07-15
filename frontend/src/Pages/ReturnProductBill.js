import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
  Typography,
  Paper,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

const ReturnProductBill = () => {
  const { id } = useParams();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchBill = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`http://localhost:5000/api/bills/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBill(res.data);
    } catch (err) {
      console.error("❌ Error fetching bill:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefundAllot = async () => {
    console.log("🟢 Allot Refund button clicked");
    const token = localStorage.getItem("token");
    const returnId = bill?.returns?.[0]?._id;

    if (!returnId) {
      console.warn("⚠️ No returnId found");
      return;
    }

    try {
      const res = await axios.patch(
        `http://localhost:5000/api/returns/refund/${returnId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("✅ Refund allotted response:", res.data);

      setDialogOpen(false);
      fetchBill();
    } catch (err) {
      console.error("❌ Error allotting refund:", err);
    }
  };

  useEffect(() => {
    fetchBill();
  }, [id]);

  if (loading) return <Typography p={4}>Loading bill...</Typography>;
  if (!bill) return <Typography p={4}>Bill not found.</Typography>;

  const approvedReturns = Array.isArray(bill.returns)
    ? bill.returns.filter((ret) => ret.status === "Approved")
    : [];

  const isRefundAllotted = approvedReturns.every((ret) => ret.refundAllotted);

  return (
    <>
      <Box p={4}>
        <Typography variant="h4" gutterBottom>
          Bill Details (Return)
        </Typography>

        <Paper sx={{ p: 3 }}>
          <Typography>
            <strong>Customer:</strong> {bill.customerName}
          </Typography>
          <Typography>
            <strong>Phone:</strong> {bill.customerPhone}
          </Typography>
          <Typography>
            <strong>Email:</strong> {bill.customerEmail}
          </Typography>
          <Typography>
            <strong>Bill No:</strong> {bill.billNumber}
          </Typography>
          <Typography>
            <strong>Date:</strong> {new Date(bill.billDate).toLocaleDateString()}
          </Typography>
          <Typography>
            <strong>Time:</strong> {bill.billTime}
          </Typography>
          <Typography>
            <strong>Payment:</strong> {bill.paymentMethod} ({bill.paymentStatus})
          </Typography>

          <Divider sx={{ my: 2 }} />
          <Typography variant="h6">Items</Typography>
          <List>
            {bill.items.map((item, idx) => (
              <ListItem key={idx}>
                <ListItemText
                  primary={`${item.itemName} - Qty: ${item.quantity} - ₹${item.salePrice}`}
                />
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />
          <Typography>
            <strong>Subtotal:</strong> ₹{bill.subTotal}
          </Typography>
          <Typography>
            <strong>Tax:</strong> ₹{bill.taxAmount}
          </Typography>
          <Typography>
            <strong>Discount:</strong> ₹{bill.discountAmount}
          </Typography>
          <Typography variant="h6">
            <strong>Total:</strong> ₹{bill.totalAmount}
          </Typography>
        </Paper>

        {approvedReturns.length > 0 && (
          <Box mt={4} p={2} bgcolor="#e0f7fa" borderRadius="8px">
            <Typography variant="h6">✅ Return request has been approved</Typography>
            <Typography mt={1}>
              <strong>Returned Items:</strong>
            </Typography>

            <List>
              {approvedReturns.map((ret, idx) => (
                <ListItem key={idx}>
                  <ListItemText
                    primary={`${ret.itemName} - Qty: ${ret.quantity} - ₹${ret.salePrice}`}
                  />
                </ListItem>
              ))}
            </List>

            {!isRefundAllotted ? (
              <Button
                variant="contained"
                color="error"
                sx={{ mt: 2 }}
                onClick={() => {
                  console.log("🟡 Open dialog");
                  setDialogOpen(true);
                }}
              >
                Allot Refund
              </Button>
            ) : (
              <Typography mt={2} color="green">
                💸 Refund Allotted
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {/* ✅ Dialog moved outside Box to avoid nested render issues */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Confirm Refund Allotment</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to allot refund for this returned item?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleRefundAllot}>
            Allot Refund
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ReturnProductBill;
