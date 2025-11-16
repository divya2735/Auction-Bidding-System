import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

const SignupForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    termsAccepted: false,
  });

  const [errors, setErrors] = useState({});

  // Handle field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
  e.preventDefault();

  const newErrors = {};
  if (!formData.firstName.trim()) newErrors.firstName = 'First name is required.';
  if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required.';
  if (!formData.email.trim()) newErrors.email = 'Email is required.';
  if (!formData.password) newErrors.password = 'Password is required.';
  if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';
  if (!formData.role) newErrors.role = 'Role is required.';
  if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept the terms.';

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  try {
  const payload = {
    first_name: formData.firstName,
    last_name: formData.lastName,
    email: formData.email,
    password: formData.password,
    confirm_password: formData.confirmPassword,
    role: formData.role,
  };

  const response = await axiosInstance.post('/users/register/', payload);

  // Save email to use in OTP verification
  localStorage.setItem('emailForOtp', formData.email);

  // Show proper message
  const message = response.data.message;
  if (message.includes('not verified')) {
    alert('⚠️ You already registered but didn’t verify. OTP has been resent to your email.');
  } else {
    alert('✅ Registration successful. OTP sent to your email.');
  }

  // Navigate to OTP verification page
  navigate('/verify-otp');

} catch (error) {
  console.error('Registration failed:', error.response?.data || error.message);

  if (error.response?.data) {
    const serverErrors = {};
    for (const key in error.response.data) {
      serverErrors[key] = error.response.data[key][0];
    }
    setErrors(serverErrors);
  } else {
    setErrors({ general: 'Something went wrong. Please try again.' });
  }
}
};

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg">
        <div className="text-center mb-6">
          <img src="luxe-bid-logo.png" alt="LuxeBid Logo" className="mx-auto w-36 mb-4" />
          <h2 className="text-3xl font-bold text-gray-800">Create Your Account</h2>
          <p className="text-gray-500 text-sm">Enter your details below to get started.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="********"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="********"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Role</option>
              <option value="seller">Seller</option>
              <option value="buyer">Buyer</option>
            </select>
            {errors.role && <p className="text-red-500 text-sm">{errors.role}</p>}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="terms"
              name="termsAccepted"
              checked={formData.termsAccepted}
              onChange={handleChange}
              className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
              I agree to the terms and conditions.
            </label>
          </div>
          {errors.termsAccepted && <p className="text-red-500 text-sm">{errors.termsAccepted}</p>}

          <button
            type="submit"
            className="w-full py-2.5 bg-black text-white rounded-md hover:bg-gray-800 transition-colors duration-200"
          >
            Sign Up
          </button>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{' '}
            <a href="/login" className="text-indigo-600 hover:underline">
              Log In
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignupForm;
