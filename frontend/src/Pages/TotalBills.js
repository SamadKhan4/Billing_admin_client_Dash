import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Trash, Search as SearchIcon } from 'lucide-react';
import {
  TextField,
  Autocomplete,
  InputAdornment,
  IconButton,
} from '@mui/material';

const TotalBills = () => {
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [userType, setUserType] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchOptions, setSearchOptions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const billsPerPage = 10;

  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const API_BASE = 'http://localhost:5000';

  useEffect(() => {
    const type = localStorage.getItem('userType');
    setUserType(type);
  }, []);

  const fetchBills = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const type = localStorage.getItem('userType');
      const endpoint = type === 'Admin' ? '/api/bills/all' : '/api/bills';
      const res = await fetch(`${API_BASE}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.msg || 'Failed to fetch bills');
      const sorted = data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setBills(sorted);
      setFilteredBills(sorted);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasFetched.current) {
      fetchBills();
      hasFetched.current = true;
    }
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bill?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/bills/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.msg || 'Failed to delete bill');
      const updated = bills.filter((bill) => bill._id !== id);
      setBills(updated);
      setFilteredBills(updated);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleFilter = (status) => {
    setSelectedStatus(status);
    setSearchInput('');
    setCurrentPage(1);
    if (status === 'All') {
      setFilteredBills(bills);
    } else {
      const filtered = bills.filter((bill) => bill.paymentStatus === status);
      setFilteredBills(filtered);
    }
  };

  const getStatusCount = () => {
    if (!selectedStatus || selectedStatus === 'All') return '';
    const count = filteredBills.length;
    const iconMap = {
      Paid: '✅',
      Unpaid: '❌',
      Pending: '⏳',
    };
    const colorMap = {
      Paid: 'text-green-600',
      Unpaid: 'text-red-600',
      Pending: 'text-yellow-600',
    };
    return (
      <h2 className={`text-2xl font-semibold mb-4 ${colorMap[selectedStatus]}`}>
        {iconMap[selectedStatus]} {selectedStatus} Bills ({count})
      </h2>
    );
  };

  const handleSearchInputChange = async (event, newInput) => {
    setSearchInput(newInput);
    setSelectedStatus('');
    setCurrentPage(1);
    const token = localStorage.getItem('token');

    if (!newInput.trim()) {
      setSearchOptions([]);
      setFilteredBills(bills);
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE}/api/bills/all?search=${encodeURIComponent(newInput)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();

      const options = (data || []).map((bill) => ({
        label: `${bill.billNumber} - ${bill.customerName}`,
        value: bill._id,
      }));

      setSearchOptions(options);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const handleSearchSelect = async (e, selectedOption) => {
    if (!selectedOption?.label) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(
        `${API_BASE}/api/bills/all?search=${encodeURIComponent(searchInput)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setFilteredBills(data);
      setCurrentPage(1);
    } catch (err) {
      console.error('Search fetch failed', err);
    }
  };

  const indexOfLast = currentPage * billsPerPage;
  const indexOfFirst = indexOfLast - billsPerPage;
  const currentBills = filteredBills.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredBills.length / billsPerPage);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">📋 Total Bills Dashboard</h1>

      {/* Search Input */}
      <div className="mb-6 w-full sm:w-[400px]">
        <Autocomplete
          freeSolo
          options={searchOptions}
          inputValue={searchInput}
          onInputChange={handleSearchInputChange}
          onChange={handleSearchSelect}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search by Bill No or Customer Name"
              variant="outlined"
              size="small"
              fullWidth
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    <InputAdornment position="end">
                      <IconButton>
                        <SearchIcon size={18} />
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

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-4 mb-6">
        {['All', 'Paid', 'Unpaid', 'Pending'].map((status) => (
          <button
            key={status}
            onClick={() => handleFilter(status)}
            className={`px-4 py-2 rounded text-white ${status === 'Paid'
              ? 'bg-green-500 hover:bg-green-600'
              : status === 'Unpaid'
                ? 'bg-red-500 hover:bg-red-600'
                : status === 'Pending'
                  ? 'bg-yellow-500 hover:bg-yellow-600'
                  : 'bg-gray-500 hover:bg-gray-600'
              }`}
          >
            {status} Bills
          </button>
        ))}
      </div>

      {/* Status Heading */}
      {getStatusCount()}

      {/* Display Bills */}
      {loading ? (
        <p>Loading bills...</p>
      ) : error ? (
        <p className="text-red-500 font-medium">❌ Error: {error}</p>
      ) : currentBills.length === 0 ? (
        <p>No bills found.</p>
      ) : (
        <div className="space-y-4">
          {currentBills.map((bill) => (
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
              <p><strong>Date:</strong> {new Date(bill.createdAt).toLocaleDateString()}</p>

              <div className="absolute bottom-4 right-5 flex gap-4">
                <button
                  title="View Bill"
                  onClick={() => navigate(`/bill/${bill._id}`)}
                  className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-all duration-200"
                >
                  <Eye size={20} className="text-blue-600 hover:scale-110 transition-transform" />
                </button>
                {userType === 'Admin' && (
                  <button
                    title="Delete Bill"
                    onClick={() => handleDelete(bill._id)}
                    className="p-2 rounded-full bg-red-100 hover:bg-red-200 transition-all duration-200"
                  >
                    <Trash size={20} className="text-red-600 hover:scale-110 transition-transform" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {filteredBills.length > billsPerPage && (
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
    </div>
  );
};

export default TotalBills;
