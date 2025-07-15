// Pages/PaidBills.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BillCard from '../Components/BillCard';

const PaidBills = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaidBills = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('http://localhost:5000/api/bills/status?status=Paid', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBills(res.data);
      } catch (err) {
        console.error('Error fetching paid bills:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPaidBills();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-green-600">✅ Paid Bills ({bills.length})</h1>
      {loading ? (
        <p>Loading paid bills...</p>
      ) : bills.length === 0 ? (
        <p>No paid bills found.</p>
      ) : (
        bills.map((bill) => <BillCard key={bill._id} bill={bill} />)
      )}
    </div>
  );
};

export default PaidBills;
