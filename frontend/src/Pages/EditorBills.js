import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Search, UserCheck } from 'lucide-react';
import {
  TextField,
  Autocomplete,
  InputAdornment,
  IconButton,
} from '@mui/material';

const EditorBills = () => {
  const [allBills, setAllBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [selectedValue, setSelectedValue] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const billsPerPage = 10;

  const navigate = useNavigate();
  const API_BASE = 'http://localhost:5000';

  // 🔄 Fetch all bills for client-side pagination/filtering/search
  const fetchAllBills = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/bills/mine?all=true`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.msg || 'Failed to fetch full bill list');

      const sorted = data.bills.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setAllBills(sorted);
    } catch (err) {
      setError(err.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBills();
  }, []);

  useEffect(() => {
    const filtered = allBills.filter((bill) => {
      const matchesStatus = activeFilter === 'All' || bill.paymentStatus === activeFilter;
      const matchesSearch = bill.billNumber?.toLowerCase().includes(searchInput.toLowerCase());
      return matchesStatus && (!searchInput.trim() || matchesSearch);
    });

    setFilteredBills(filtered);
    setCurrentPage(1); // reset pagination on filter/search change
  }, [allBills, activeFilter, searchInput]);

  const handleFilter = (status) => {
    setActiveFilter(status);
    setSelectedValue(null);
    setSearchInput('');
  };

  const handleSearch = () => {
    if (!searchInput.trim()) {
      setSelectedValue(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'text-green-600';
      case 'Unpaid': return 'text-red-600';
      case 'Pending': return 'text-yellow-600';
      default: return 'text-gray-800';
    }
  };

  const handleView = (id) => {
    navigate(`/bill/${id}`);
  };

  const handleAgentView = (id) => {
    navigate(`/agent-bill/${id}`);
  };

  const totalPages = Math.ceil(filteredBills.length / billsPerPage);
  const paginatedBills = filteredBills.slice(
    (currentPage - 1) * billsPerPage,
    currentPage * billsPerPage
  );

  const statusCounts = {
    Paid: allBills.filter(b => b.paymentStatus === 'Paid').length,
    Unpaid: allBills.filter(b => b.paymentStatus === 'Unpaid').length,
    Pending: allBills.filter(b => b.paymentStatus === 'Pending').length,
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">📋 Bills Created by Me</h1>

      {/* 🔍 Search */}
      <div className="mb-6 w-full sm:w-[300px]">
        <Autocomplete
          options={allBills.map((bill) => bill.billNumber)}
          value={selectedValue}
          inputValue={searchInput}
          onInputChange={(e, newInput) => {
            setSearchInput(newInput);
            if (newInput.trim() === '') {
              setSelectedValue(null);
              handleSearch();
            }
          }}
          onChange={(e, newValue) => {
            setSelectedValue(newValue);
            setSearchInput(newValue || '');
            handleSearch();
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search by Bill No."
              variant="outlined"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    <InputAdornment position="end">
                      <IconButton onClick={handleSearch}>
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

      {/* 🔘 Filter Buttons */}
      <div className="flex flex-wrap gap-4 mb-4">
        {['All', 'Paid', 'Unpaid', 'Pending'].map((status) => (
          <button
            key={status}
            onClick={() => handleFilter(status)}
            className={`${activeFilter === status
              ? status === 'Paid'
                ? 'bg-green-600'
                : status === 'Unpaid'
                  ? 'bg-red-600'
                  : status === 'Pending'
                    ? 'bg-yellow-600'
                    : 'bg-gray-600'
              : status === 'Paid'
                ? 'bg-green-500'
                : status === 'Unpaid'
                  ? 'bg-red-500'
                  : status === 'Pending'
                    ? 'bg-yellow-500'
                    : 'bg-gray-500'
              } text-white px-4 py-2 rounded hover:opacity-90`}
          >
            {status} Bills
          </button>
        ))}
      </div>

      {/* 🧮 Count Display */}
      {activeFilter !== 'All' && (
        <div className={`mb-4 text-lg font-semibold ${getStatusColor(activeFilter)}`}>
          {activeFilter === 'Paid' && '✅'}
          {activeFilter === 'Unpaid' && '❌'}
          {activeFilter === 'Pending' && '⏳'}
          {activeFilter} Bills: {statusCounts[activeFilter]}
        </div>
      )}

      {/* 📜 Bill List */}
      {loading ? (
        <p>Loading bills...</p>
      ) : error ? (
        <p className="text-red-500 font-medium">❌ Error: {error}</p>
      ) : paginatedBills.length === 0 ? (
        <p>No bills found for selected status or search.</p>
      ) : (
        <div className="space-y-4">
          {paginatedBills.map((bill) => (
            <div
              key={bill._id}
              className="bg-white border border-gray-300 rounded-xl p-5 shadow hover:shadow-md transition-all duration-300 relative"
            >
              <strong>Created By:</strong> {bill.createdBy?.username || 'N/A'}
              <p><strong>Bill No:</strong> {bill.billNumber}</p>
              <p><strong>Customer:</strong> {bill.customerName}</p>
              <p><strong>Phone:</strong> {bill.customerPhone}</p>
              <p><strong>Email:</strong> {bill.customerEmail}</p>
              <p><strong>Total:</strong> ₹{bill.totalAmount}</p>
              <p><strong>Status:</strong> {bill.paymentStatus}</p>
              <p><strong>Agent:</strong> {bill.agentName?.username || 'N/A'}</p>
              <p><strong>Date:</strong> {new Date(bill.createdAt).toLocaleDateString()}</p>

              <div className="absolute bottom-4 right-5 flex gap-4">
                {/* 👁️ View Bill */}
                <button
                  title="View Bill"
                  onClick={() => handleView(bill._id)}
                  className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-all duration-200"
                >
                  <Eye size={20} className="text-blue-600 hover:scale-110 transition-transform" />
                </button>

                {/* 🧑‍💼 Agent Commission View */}
                <button
                  title="Agent Bill"
                  onClick={() => handleAgentView(bill._id)}
                  className="p-2 rounded-full bg-green-100 hover:bg-green-200 transition-all duration-200"
                >
                  <UserCheck size={20} className="text-green-700 hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🔢 Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex justify-center mt-8 gap-2 flex-wrap">
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
                ? 'bg-blue-600 text-white'
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
    </div>
  );
};

export default EditorBills;
