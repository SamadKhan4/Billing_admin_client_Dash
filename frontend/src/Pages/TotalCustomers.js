import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Autocomplete,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Typography,
} from "@mui/material";
import { Search } from "lucide-react";

const TotalCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [selectedValue, setSelectedValue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const customersPerPage = 10;

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userType = localStorage.getItem("userType");
  const API_BASE = "http://localhost:5000";

  useEffect(() => {
    const fetchCustomers = async () => {
      if (!token || userType?.toLowerCase() !== "admin") {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/api/bills/customers/list`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch customers");

        const data = await res.json();
        const reversed = [...(data.customers || [])].reverse();
        setCustomers(reversed);
        setFilteredCustomers(reversed);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [token, userType]);

  const handleSearch = async (value) => {
    const name = value?.trim();
    if (!name) {
      setFilteredCustomers(customers);
      setCurrentPage(1);
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE}/api/bills/customers/list?name=${encodeURIComponent(name)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Failed to search");

      const data = await res.json();
      const reversed = [...(data.customers || [])].reverse();
      setFilteredCustomers(reversed);
      setCurrentPage(1);
    } catch (err) {
      console.error("Search error:", err);
      setError("Search failed");
    }
  };

  const handleGoBack = () => {
    setFilteredCustomers(customers);
    setSearchInput("");
    setSelectedValue(null);
    setCurrentPage(1);
  };

  const indexOfLast = currentPage * customersPerPage;
  const indexOfFirst = indexOfLast - customersPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

  if (!token || userType?.toLowerCase() !== "admin") {
    return (
      <div className="text-center mt-10 text-red-600 text-xl">
        ❌ You are not authorized to view this page.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md relative">
      {/* Header + Search */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#f59e0b" }}>
          Total Customers
        </Typography>

        <div className="w-full sm:w-[300px]">
          <Autocomplete
            options={customers.map((cust) => cust.name || "")}
            getOptionLabel={(option) => option}
            value={selectedValue}
            inputValue={searchInput}
            onInputChange={(e, newInput) => {
              setSearchInput(newInput);
            }}
            onChange={(e, newVal) => {
              setSelectedValue(newVal);
              setSearchInput(newVal || "");
              if (newVal?.trim()) handleSearch(newVal);
              else handleSearch(""); // Show all if cleared
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search customers..."
                fullWidth
                size="small"
                variant="outlined"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch(searchInput);
                }}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      <InputAdornment position="end">
                        <IconButton onClick={() => handleSearch(searchInput)}>
                          <Search size={20} />
                        </IconButton>
                      </InputAdornment>
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </div>
      </div>

      {/* Reset Button */}
      {filteredCustomers.length !== customers.length && (
        <div className="flex justify-end mb-3">
          <button
            onClick={handleGoBack}
            className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded"
          >
            ← Go Back
          </button>
        </div>
      )}

      {/* Data section */}
      {loading ? (
        <div className="text-center">
          <CircularProgress />
        </div>
      ) : error ? (
        <p className="text-center text-red-600">Error: {error}</p>
      ) : currentCustomers.length === 0 ? (
        <p className="text-center text-gray-500">❌ Customer not found.</p>
      ) : (
        <ul className="space-y-4">
          {currentCustomers.map((cust) => (
            <li
              key={cust.email}
              className="border border-gray-300 p-4 rounded-lg relative shadow"
            >
              <p>
                <strong>Name:</strong> {cust.name || "N/A"}
              </p>
              <p>
                <strong>Email:</strong> {cust.email || "N/A"}
              </p>
              <p>
                <strong>Phone:</strong> {cust.phone || "N/A"}
              </p>

              <button
                onClick={() =>
                  navigate(`/customer-details/${encodeURIComponent(cust.name)}`)
                }
                className="absolute bottom-3 right-3 text-sm bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
              >
                View Details
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Pagination */}
      {filteredCustomers.length > customersPerPage && (
        <div className="flex justify-center mt-6 gap-2 flex-wrap">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            ⬅️ Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-4 py-2 rounded ${
                currentPage === i + 1
                  ? "bg-yellow-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Next ➡️
          </button>
        </div>
      )}
    </div>
  );
};

export default TotalCustomers;
