import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';

function Register({ setIsAuthenticated, setUserRole }) {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'student' });
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // Step 1: Registration, Step 2: OTP Verification
  const [userId, setUserId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/register', formData);
      setUserId(response.data.userId);
      setStep(2);
      alert('OTP sent to your email.');
    } catch (error) {
      alert(error.response?.data?.error || 'Error registering');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/verify-otp', { userId, otp });
      const loginResponse = await axios.post('http://localhost:3001/login', { email: formData.email, password: formData.password });
      localStorage.setItem('authToken', loginResponse.data.token);
      localStorage.setItem('userRole', loginResponse.data.role);
      setIsAuthenticated(true);
      setUserRole(loginResponse.data.role);
      navigate('/');
    } catch (error) {
      alert(error.response?.data?.message || 'Invalid OTP');
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-black">
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
      >
        <source src="/login.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="relative z-10 w-full max-w-md p-8 space-y-8 bg-black bg-opacity-75 rounded-lg shadow-md">
        {step === 1 ? (
          <form onSubmit={handleRegister} className="space-y-6">
            <h2 className="text-2xl font-bold text-cyan-400 text-center font-mono">Register</h2>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full p-2 mt-1 border border-gray-300 rounded-md bg-gray-800 text-white focus:outline-none focus:ring focus:ring-indigo-500"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-2 mt-1 border border-gray-300 rounded-md bg-gray-800 text-white focus:outline-none focus:ring focus:ring-indigo-500"
            />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full p-2 mt-1 border border-gray-300 rounded-md bg-gray-800 text-white focus:outline-none focus:ring focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
                )}
              </button>
            </div>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-2 mt-1 border border-gray-300 rounded-md bg-gray-800 text-white focus:outline-none focus:ring focus:ring-indigo-500"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
            <button
              type="submit"
              className="w-full py-2 font-bold text-white bg-black rounded-md hover:bg-green-600 focus:outline-none focus:ring focus:ring-indigo-500"
            >
              Register
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <h2 className="text-2xl font-bold text-cyan-400 text-center font-mono">Verify OTP</h2>
            <input
              type="text"
              name="otp"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              className="w-full p-2 mt-1 border border-gray-300 rounded-md bg-gray-800 text-white focus:outline-none focus:ring focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="w-full py-2 font-bold text-white bg-black rounded-md hover:bg-green-600 focus:outline-none focus:ring focus:ring-indigo-500"
            >
              Verify OTP
            </button>
          </form>
        )}
        <p className="text-white text-center">
          Already have an account? <button className="text-green-400" onClick={() => navigate('/login')}>Login</button>
        </p>
      </div>
    </div>
  );
}

export default Register;
