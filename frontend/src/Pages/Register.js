import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = ({ token, userType }) => {
  const [formData, setFormData] = useState({ username: '', email: '', phone: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/users/register', formData);
      setMessage(response.data.msg);
      setTimeout(() => navigate('/login'), 1500);
    } catch (error) {
      setMessage(error.response?.data?.msg || '❌ Error creating user');
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
      <div
        className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl border border-yellow-300 bg-gradient-to-br from-yellow-100 to-yellow-200"
        style={{
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
        }}
      >
        <h2 className="text-3xl font-bold text-center text-black mb-3 tracking-wide">Create Editor</h2>
        <p className="text-center text-gray-700 mb-5 italic">Only Admin can create new editors</p>

        {message && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-5 text-center font-semibold">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 ">
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
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-yellow-400 transition"
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
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
            className="w-full bg-black text-yellow-300 py-3 rounded-xl font-semibold shadow-lg hover:bg-yellow-400 hover:text-black transition duration-300"
          >
            Create Editor
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
