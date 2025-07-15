// Pages/UnpaidBills.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BillCard from '../Components/BillCard';

const UnpaidBills = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUnpaidBills = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('http://localhost:5000/api/bills/status?status=Unpaid', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBills(res.data);
      } catch (err) {
        console.error('Error fetching unpaid bills:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUnpaidBills();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-red-600">❌ Unpaid Bills ({bills.length})</h1>
      {loading ? (
        <p>Loading unpaid bills...</p>
      ) : bills.length === 0 ? (
        <p>No unpaid bills found.</p>
      ) : (
        bills.map((bill) => <BillCard key={bill._id} bill={bill} />)
      )}
    </div>
  );
};

export default UnpaidBills;
