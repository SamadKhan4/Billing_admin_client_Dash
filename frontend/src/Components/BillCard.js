// Components/BillCard.js
import React from "react";
import { Link } from "react-router-dom";
import { Eye , Trash } from "lucide-react";

const BillCard = ({ bill }) => {
  return (
    <div className="bg-white border border-gray-300 rounded-xl p-5 mb-4 shadow relative">
      <p><strong>Bill No:</strong> {bill.billNumber}</p>
      <p><strong>Customer:</strong> {bill.customerName}</p>
      <p><strong>Phone:</strong> {bill.customerPhone}</p>
      <p><strong>Email:</strong> {bill.customerEmail}</p>
      <p><strong>Total:</strong> ₹{bill.totalAmount}</p>
      <p><strong>Status:</strong> {bill.paymentStatus}</p>
      <p><strong>Date:</strong> {new Date(bill.createdAt).toLocaleDateString()}</p>

      <div className="absolute bottom-4 right-5 flex gap-4">
        <Link to={`/bill/${bill._id}`} title="View Bill">
          <Eye className="text-blue-600 hover:scale-110" />
        </Link>
        <button title="Delete Bill" className="text-red-600 hover:text-red-800">
          <Trash size={20} />
        </button>
      </div>
    </div>
  );
};

export default BillCard;
