import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Typography,
  Paper,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
} from "@mui/material";

const Request = () => {
  const [returnRequests, setReturnRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchRequests = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("http://localhost:5000/api/returns/requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReturnRequests(res.data);
    } catch (error) {
      console.error("Error fetching return requests:", error);
    }
  };

  const handleApprove = (request) => {
    setSelectedRequest(request);
    setDialogOpen(true);
  };

  const confirmApprove = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `http://localhost:5000/api/returns/requests/${selectedRequest._id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDialogOpen(false);
      fetchRequests();
    } catch (error) {
      console.error("Approval failed:", error);
    }
  };

  const handleReject = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `http://localhost:5000/api/returns/requests/${id}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchRequests();
    } catch (error) {
      console.error("Rejection failed:", error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const totalPages = Math.ceil(returnRequests.length / itemsPerPage);
  const paginatedRequests = returnRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Return Requests
      </Typography>

      {paginatedRequests.map((req, idx) => (
        <Paper
          key={idx}
          sx={{
            p: 2,
            my: 2,
            backgroundColor:
              req.status === "Approved"
                ? "#e6ffee"
                : req.status === "Rejected"
                  ? "#ffe6e6"
                  : "white",
          }}
        >
          <Box mb={1}>
            <Typography>
              <strong>Bill No:</strong> {req.billId?.billNumber || "N/A"}
            </Typography>
            <Typography>
              <strong>Customer Name:</strong> {req.billId?.customerName || "N/A"}
            </Typography>
            <Typography>
              <strong>Requested By:</strong> {req.requestedBy?.username || "N/A"}
            </Typography>
          </Box>

          {req.products.map((prod, i) => (
            <Box key={i} ml={2} mt={1}>
              <Typography>
                • <strong>Item:</strong> {prod.itemName}
              </Typography>
              <Typography>
                <strong>Qty:</strong> {prod.quantity}, <strong>Price:</strong> ₹{prod.salePrice}
              </Typography>
            </Box>
          ))}

          <Box mt={2}>
            {req.status === "Pending" ? (
              <>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleApprove(req)}
                  sx={{ mr: 2 }}
                >
                  Approve
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleReject(req._id)}
                >
                  Reject
                </Button>
              </>
            ) : (
              <Typography
                sx={{
                  color: req.status === "Approved" ? "green" : "red",
                  fontWeight: "bold",
                }}
              >
                {req.status === "Approved"
                  ? "✅ Return Approved & Refund Allotted"
                  : "❌ Return Request Rejected"}
              </Typography>
            )}
          </Box>
        </Paper>
      ))}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(e, value) => setCurrentPage(value)}
            color="primary"
          />
        </Box>
      )}

      {/* Refund Confirmation Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Confirm Refund</DialogTitle>
        <DialogContent>
          <Typography>
            Do you want to approve and provide refund for the return request?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmApprove} variant="contained" color="success">
            Refund
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Request;
