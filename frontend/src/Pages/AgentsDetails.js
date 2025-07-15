import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  TextField,
  Autocomplete,
  Paper,
  Typography,
  Box,
  Button,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";

const AgentsDetails = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [searchInput, setSearchInput] = useState("");

  const userType = localStorage.getItem("userType")?.toLowerCase();
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/bills/agents", {
          params: { userType, username },
          headers: { Authorization: `Bearer ${token}` },
        });

        const validAgents = res.data.filter((a) => a.agentName?.trim() !== "");
        setAgents([...validAgents]);
        setFilteredAgents([...validAgents]);
      } catch (err) {
        console.error("❌ Failed to fetch agents:", err);
      }
    };

    fetchAgents();
  }, [userType, username, token]);

  const handleSearchChange = (event, value) => {
    setSearchInput(value);
    setFilteredAgents(
      value
        ? agents.filter((a) =>
          a.agentName?.toLowerCase().includes(value.toLowerCase())
        )
        : agents
    );
  };

  const handleDeleteAgent = useCallback(
    async (agentName) => {
      if (!window.confirm(`Delete agent "${agentName}"?`)) return;

      try {
        await axios.delete(
          `http://localhost:5000/api/bills/delete-agent/${encodeURIComponent(
            agentName
          )}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const updated = agents.filter((a) => a.agentName !== agentName);
        setAgents(updated);
        setFilteredAgents(updated);

        alert("✅ Agent deleted successfully.");
      } catch (err) {
        console.error("❌ Failed to delete agent:", err);
        alert("❌ Failed to delete agent.");
      }
    },
    [agents, token]
  );

  return (
    <Box p={3} sx={{ background: "#f9f9f9", minHeight: "100vh" }}>
      <Typography
        variant="h5"
        fontWeight="bold"
        gutterBottom
        sx={{ color: "#000" }}
      >
        Agent Commission Details
      </Typography>

      <Autocomplete
        options={agents.map((a) => a.agentName)}
        value={searchInput}
        onInputChange={handleSearchChange}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search Agent"
            variant="outlined"
            sx={{
              backgroundColor: "#fff",
              borderRadius: 2,
              width: "100%",
              maxWidth: 400,
              mb: 3,
            }}
          />
        )}
        clearOnEscape
      />

      {filteredAgents.length > 0 ? (
        <>
          <Typography
            variant="subtitle1"
            mb={2}
            sx={{ fontWeight: 600, color: "#333" }}
          >
            Total Agents: {filteredAgents.length}
          </Typography>

          <Box
            sx={{
              maxWidth: "100%",
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                md: "1fr 1fr 1fr",
              },
            }}
          >
            {filteredAgents.map((agent, index) => (
              <Paper
                key={index}
                elevation={4}
                sx={{
                  p: 2,
                  backgroundColor: "#fff",
                  borderRadius: 3,
                  border: "1px solid #eee",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: 180,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
              >
                <Box mb={2}>
                  <Typography fontWeight="bold" color="black" gutterBottom>
                    Agent Name:{" "}
                    <Box component="span" sx={{ fontWeight: 500 }}>
                      {agent.agentName}
                    </Box>
                  </Typography>
                  <Typography
                    sx={{
                      color: "#2e7d32",
                      fontWeight: 600,
                      fontSize: "0.95rem",
                    }}
                  >
                    Total Commission: ₹{" "}
                    {Number(agent.totalCommission || 0).toFixed(2)}
                  </Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" mt="auto">
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: "#000",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      textTransform: "none",
                      borderRadius: "6px",
                      px: 2,
                      py: 0.5,
                      minWidth: "100px",
                      boxShadow: "1px 1px 2px rgba(0,0,0,0.4)",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        backgroundColor: "#1a1a1a",
                        transform: "translateY(-1px)",
                        boxShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                      },
                    }}
                    onClick={() =>
                      navigate(
                        `/agent-full-details/${encodeURIComponent(agent.agentName)}`
                      )
                    }
                  >
                    View Details
                  </Button>
                  <IconButton
                    onClick={() => handleDeleteAgent(agent.agentName)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Paper>
            ))}
          </Box>
        </>
      ) : (
        <Typography variant="body1" color="text.secondary">
          No agents found.
        </Typography>
      )}
    </Box>
  );
};

export default AgentsDetails;
