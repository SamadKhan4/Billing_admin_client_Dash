import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Paper,
  Container,
  MenuItem,
} from "@mui/material";

const CustomerRegister = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    userType: "customer", // default
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loggedInUserType = localStorage.getItem("userType"); // ✅ Get current user type

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");

      const endpoint =
        formData.userType === "agent"
          ? "register-agent"
          : formData.userType === "vendor"
            ? "register-vendor"
            :formData.userType === "editor"
            ? "register"
            : "register-customer";

      const response = await fetch(
        `http://localhost:5000/users/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(data.msg);
        setFormData({
          username: "",
          email: "",
          phone: "",
          password: "",
          userType: "customer",
        });
      } else {
        setError(data.msg || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      setError("Server error");
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ mt: 6, p: 4 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Register {loggedInUserType === "Admin" ? "Customer / Agent / Vendor" : "Customer"}
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
          />

          <TextField
            select
            fullWidth
            label="User Type"
            name="userType"
            value={formData.userType}
            onChange={handleChange}
            margin="normal"
            required
          >
            <MenuItem value="customer">Customer</MenuItem>

            {(loggedInUserType === "Admin" || formData.userType === "agent") && (
              <MenuItem value="agent">Agent</MenuItem>
            )}

            {(loggedInUserType === "Admin" || formData.userType === "vendor") && (
              <MenuItem value="vendor">Vendor</MenuItem>
            )}

            {/* ✅ Editor option - only for Admin */}
            {(loggedInUserType === "Admin" || formData.userType === "editor") && (
              <MenuItem value="editor">Editor</MenuItem>
            )}
          </TextField>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            Register
          </Button>
        </form>

        {message && (
          <Typography color="success.main" align="center" mt={2}>
            ✅ {message}
          </Typography>
        )}
        {error && (
          <Typography color="error" align="center" mt={2}>
            ❌ {error}
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default CustomerRegister;
