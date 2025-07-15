// 📄 Notification.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Typography, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleNotificationClick = async (note) => {
    const { message, type, data } = note;
    const token = localStorage.getItem("token");

    // ✅ 1️⃣ Return request submitted → Go to /requests
    if (type === "return_request") {
      navigate("/requests");
      return;
    }

    // ✅ 2️⃣ Return approved/rejected → navigate to bill with return details
    if (type === "return" && message.includes("BILL-")) {
      const billNumberMatch = message.match(/BILL-\d+/);
      if (!billNumberMatch) {
        console.warn("❌ Bill number not found in message:", message);
        return;
      }

      const billNumber = billNumberMatch[0].trim();
      console.log("Parsed Bill Number:", billNumber);

      try {
        const res = await axios.get(`http://localhost:5000/api/bills/number/${billNumber}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const bill = res.data;

        // Use new regex compatible with multiline message
        const itemNameMatch = message.match(/Item(?: :-|:)? (.*)/);
        const qtyMatch = message.match(/Qty(?: :-|:)? (\d+)/);
        const priceMatch = message.match(/₹([\d.]+)/);

        const returnedItem = {
          itemName: itemNameMatch?.[1]?.trim() || "N/A",
          quantity: parseInt(qtyMatch?.[1]) || 0,
          salePrice: parseFloat(priceMatch?.[1]) || 0,
          status: "Rejected",
          refundAllotted: false,
        };

        navigate(`/bill/${bill._id}`, {
          state: {
            returnStatus: "Rejected",
            returnedItems: [returnedItem],
          },
        });
      } catch (err) {
        console.error("❌ Failed to fetch bill from billNumber:", err);
        alert("Bill not found for this notification.");
      }
      return;
    }

    // ✅ 2.5️⃣ Exchange notification → navigate to exchanged bill page
    if (type === "exchange" && data?.billId) {
      navigate(`/exchanged-bill/${data.billId}`);
      return;
    }

    // ✅ 3️⃣ New user registration → go to user details
    else if (type === "user_registration" && data) {
      navigate("/user-details", { state: { user: data } });
    }

    // ✅ 4️⃣ Welcome login message
    else if (type === "login") {
      alert(message);
    }

    // ✅ 5️⃣ Fallback
    else {
      console.warn("⚠️ Unknown notification type:", type);
    }
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Notifications
      </Typography>

      {notifications.length === 0 ? (
        <Typography>No notifications yet.</Typography>
      ) : (
        notifications.map((note, idx) => (
          <Paper
            key={idx}
            sx={{
              p: 2,
              mb: 2,
              cursor: "pointer",
              transition: "0.2s",
              "&:hover": { backgroundColor: "#fef3c7" },
            }}
            onClick={() => handleNotificationClick(note)}
          >
            <Typography style={{ whiteSpace: "pre-line" }}>
              {note.message}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(note.createdAt).toLocaleString()}
            </Typography>
          </Paper>
        ))
      )}
    </Box>
  );
};

export default Notification;
