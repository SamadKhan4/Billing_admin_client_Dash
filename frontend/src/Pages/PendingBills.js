// Pages/PendingBills.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BillCard from '../Components/BillCard';

const PendingBills = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingBills = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('http://localhost:5000/api/bills/status?status=Pending', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBills(res.data);
      } catch (err) {
        console.error('Error fetching pending bills:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingBills();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-yellow-600">🕒 Pending Bills ({bills.length})</h1>
      {loading ? (
        <p>Loading pending bills...</p>
      ) : bills.length === 0 ? (
        <p>No pending bills found.</p>
      ) : (
        bills.map((bill) => <BillCard key={bill._id} bill={bill} />)
      )}
    </div>
  );
};

export default PendingBills;
