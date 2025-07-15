import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-100 to-yellow-200 px-4 text-center">
      
      {/* Animated Website Title */}
      <motion.h1
        className="text-5xl md:text-6xl font-extrabold text-yellow-500 mb-4 drop-shadow"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        QUICK-BILL
      </motion.h1>

      {/* Subtitle / Tagline */}
      <motion.p
        className="text-lg md:text-xl text-gray-800 font-medium mb-8 max-w-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 1 }}
      >
        "Precision billing made simple with <span className="text-yellow-600 font-semibold">Quick-Bill</span>."
      </motion.p>

      {/* Login Button */}
      <motion.div
        className="flex gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
      >
        <button
          className="bg-yellow-400 text-black font-semibold px-8 py-3 rounded-full shadow-md hover:bg-yellow-500 hover:scale-105 transition-all duration-300"
          onClick={() => navigate("/login")}
        >
          Login
        </button>
      </motion.div>
    </div>
  );
};

export default Home;
