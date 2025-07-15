import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Login = ({ setToken, setUserType }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await axios.post('http://localhost:5000/users/login', formData);
      const { token, msg, userType, username } = response.data;

      if (!token || !userType || !username) {
        throw new Error("Invalid login response from server");
      }

      localStorage.setItem('token', token);
      localStorage.setItem('userType', userType);
      localStorage.setItem('username', username);

      setToken(token);
      setUserType(userType);
      setMessage(msg || 'Login successful');

      if (userType.toLowerCase() === 'admin') {
        navigate('/admin-panel');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Login error:", error);
      const errMsg = error.response?.data?.msg || error.message || 'Login failed';
      setMessage(errMsg);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <h1 className="text-4xl font-extrabold text-black-600 mb-6 text-center drop-shadow-md ">
        QUICK-BILL LOGIN
      </h1>

      <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl border border-yellow-300 bg-gradient-to-br from-yellow-100 to-yellow-200">
        <h2 className="text-2xl font-bold text-center text-black mb-3 tracking-wide">Welcome Back</h2>
        <p className="text-center text-gray-700 mb-5 italic">Login to your account</p>

        {message && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-5 text-center font-semibold">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
            className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-yellow-400 transition"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-yellow-400 transition"
          />

          <button
            type="submit"
            className="w-full bg-yellow-400 text-black py-3 rounded-xl font-semibold shadow-md hover:bg-yellow-500 hover:scale-105 transition-all duration-300"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
