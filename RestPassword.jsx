import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

const ResetPassword = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Pre-fill email from localStorage
  useEffect(() => {
    const storedEmail = localStorage.getItem('resetEmail');
    if (storedEmail) {
      setFormData((prev) => ({ ...prev, email: storedEmail }));
    } else {
      alert('Email not found. Please go back and enter your email.');
      navigate('/login');
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear individual field error on change
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors[name];
      return newErrors;
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.otp.trim()) newErrors.otp = 'OTP is required.';
    if (!formData.newPassword) newErrors.new_password = 'New password is required.';
    if (!formData.confirmPassword) newErrors.confirm_password = 'Please confirm your new password.';
    if (
      formData.newPassword &&
      formData.confirmPassword &&
      formData.newPassword !== formData.confirmPassword
    ) {
      newErrors.confirm_password = 'Passwords do not match.';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    const payload = {
      email: formData.email,
      otp: formData.otp,
      new_password: formData.newPassword,
      confirm_password: formData.confirmPassword,
    };

    try {
      await axiosInstance.post('/users/reset-password/', payload);
      alert('✅ Password has been reset successfully!');
      localStorage.removeItem('resetEmail');
      navigate('/login');
    } catch (error) {
      const serverErrors = {};
      if (error.response?.data) {
        Object.entries(error.response.data).forEach(([key, value]) => {
          serverErrors[key] = Array.isArray(value) ? value.join(' ') : value;
        });
      } else {
        serverErrors.general = 'Something went wrong. Please try again.';
      }
      setErrors(serverErrors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 font-sans p-4">
      <header className="flex justify-end p-4">
        <button
          onClick={() => navigate('/login')}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          <span className="text-sm">Go back</span>
        </button>
      </header>

      <main className="flex-grow flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gray-200 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 3h10.5c.621 0 1.125.504 1.125 1.125v6.75a1.125 1.125 0 0 1-1.125 1.125H6.75a1.125 1.125 0 0 1-1.125-1.125v-6.75c0-.621.504-1.125 1.125-1.125Z" />
              </svg>
            </div>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Reset Your Password</h1>
            <p className="text-sm text-gray-500">Enter the OTP and your new password.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <div className="mt-1 w-full rounded-md border border-gray-300 shadow-sm sm:text-sm p-2 bg-gray-50 text-gray-500">
                {formData.email}
              </div>
            </div>

            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">OTP</label>
              <input
                type="text"
                id="otp"
                name="otp"
                value={formData.otp}
                onChange={handleInputChange}
                placeholder="123456"
                className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              />
              {errors.otp && <p className="text-red-500 text-sm mt-1">{errors.otp}</p>}
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              />
              {errors.new_password && <p className="text-red-500 text-sm mt-1">{errors.new_password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              />
              {errors.confirm_password && <p className="text-red-500 text-sm mt-1">{errors.confirm_password}</p>}
            </div>

            {errors.general && <p className="text-red-500 text-sm text-center mt-2">{errors.general}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-800 focus:outline-none"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ResetPassword;
