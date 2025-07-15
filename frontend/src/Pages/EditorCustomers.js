import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Autocomplete,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Search } from "lucide-react";

const EditorCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [selectedValue, setSelectedValue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const customersPerPage = 10;

  const API_BASE = "http://localhost:5000";
  const token = localStorage.getItem("token");
  const userType = localStorage.getItem("userType");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEditorCustomers = async () => {
      if (!token || userType?.toLowerCase() !== "editor") {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/api/bills/customers/my`, {
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

    fetchEditorCustomers();
  }, [token, userType]);

  const handleSearch = async (nameToSearch) => {
    const name = nameToSearch?.trim() || searchInput.trim();
    if (!name) {
      setFilteredCustomers(customers);
      setCurrentPage(1);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/bills/customers/my?name=${encodeURIComponent(name)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to search customers");

      const data = await res.json();
      const reversed = [...(data.customers || [])].reverse();
      setFilteredCustomers(reversed);
      setCurrentPage(1);
    } catch (err) {
      console.error("Search error:", err);
      setError("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    setFilteredCustomers(customers);
    setSearchInput("");
    setSelectedValue(null);
    setCurrentPage(1);
  };

  // Pagination logic
  const indexOfLast = currentPage * customersPerPage;
  const indexOfFirst = indexOfLast - customersPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

  if (!token || userType?.toLowerCase() !== "editor") {
    return (
      <div className="text-center mt-10 text-red-600 text-xl">
        ❌ You are not authorized to view this page.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md relative">
      <h1 className="text-3xl font-semibold text-center mb-6 text-yellow-600">
        My Customers
      </h1>

      <div className="mb-4 relative z-50">
        <div className="w-full sm:w-[300px]">
          <Autocomplete
            options={customers.map((cust) => cust.name)}
            value={selectedValue}
            inputValue={searchInput}
            onInputChange={(e, newInput) => {
              setSearchInput(newInput);
              if (newInput.trim() === "") {
                setFilteredCustomers(customers);  // ✅ Reset to full list
                setCurrentPage(1);                // ✅ Reset pagination
              }
            }}
            onChange={(e, newValue) => {
              setSelectedValue(newValue);
              setSearchInput(newValue || "");
              if (newValue?.trim()) {
                handleSearch(newValue);
              }
            }}
            clearOnEscape
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search customers..."
                fullWidth
                variant="outlined"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      <InputAdornment position="end">
                        <IconButton onClick={() => handleSearch()}>
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

      {loading && (
        <p className="text-center text-gray-500">Loading customers...</p>
      )}
      {error && <p className="text-center text-red-600">Error: {error}</p>}

      {!loading && !error && (
        <>
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

          {currentCustomers.length === 0 ? (
            <p className="text-center text-gray-500">No customers found.</p>
          ) : (
            <ul className="space-y-4">
              {currentCustomers.map((customer) => (
                <li
                  key={customer._id} // ✅ Use unique MongoDB ID instead of email
                  className="border border-gray-300 p-4 rounded-lg relative shadow"
                >
                  <p>
                    <strong>Name:</strong> {customer.name || "N/A"}
                  </p>
                  <p>
                    <strong>Email:</strong> {customer.email || "N/A"}
                  </p>
                  <p>
                    <strong>Phone:</strong> {customer.phone || "N/A"}
                  </p>

                  <button
                    onClick={() =>
                      navigate(`/editor-customer/${encodeURIComponent(customer.name)}`)
                    }
                    className="absolute bottom-3 right-3 text-sm bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                  >
                    View Details
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Pagination Controls */}
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
                  className={`px-4 py-2 rounded ${currentPage === i + 1
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
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
        </>
      )}
    </div>
  );
};

export default EditorCustomers;
