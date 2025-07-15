import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const RedirectToBill = () => {
  const { billNumber } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBillByNumber = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:5000/api/bills/number/${billNumber}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const bill = res.data;
        if (!bill || !bill._id) {
          navigate("/404"); // optional, or show an error
        } else {
          navigate(`/bill/${bill._id}`);
        }
      } catch (err) {
        console.error("Redirect Error:", err);
        navigate("/404");
      }
    };

    fetchBillByNumber();
  }, [billNumber, navigate]);

  return <p className="p-6 text-center">Redirecting to bill details...</p>;
};

export default RedirectToBill;
