import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from "../contexts/AuthContext";
import LoginAnimation from './LoginAnimation';

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [redirectPath, setRedirectPath] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    if (!formData.email.trim() || !formData.password) {
      setErrors({
        email: !formData.email.trim() ? "Email is required." : undefined,
        password: !formData.password ? "Password is required." : undefined,
      });
      setLoading(false);
      return;
    }

    try {
      const result = await login(formData.email.trim(), formData.password);

      if (!result.success) {
        setErrors({ general: result.error.detail || "Login failed." });
        setLoading(false);
      } else {
        const { role, is_staff, is_superuser } = result.user;

        // ✅ Determine redirect path based on role
        let path = "/";
        if (is_staff || is_superuser) {
          path = "/admin-dashboard";
        } else if (role === "seller") {
          path = "/seller-dashboard";
        } else if (role === "buyer") {
          path = "/buyer-dashboard";
        }

        // ✅ Set redirect path FIRST, then show animation
        setRedirectPath(path);
        setShowAnimation(true);
        // Don't set setLoading(false) here - keep loading true while animation plays
      }
    } catch (err) {
      console.error(err);
      setErrors({ general: "Something went wrong. Please try again." });
      setLoading(false);
    }
  };

  // ✅ Show animation instead of form when login is successful
  if (showAnimation && redirectPath) {
    return (
      <LoginAnimation
        brandName="LuxeBid"
        onComplete={() => {
          console.log("Animation complete, redirecting to:", redirectPath);
          navigate(redirectPath);
        }}
        animationDuration={4500}
      />
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#e6e9e6]">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg border border-gray-200">
        <div className="text-center mb-6">
          <img src="/luxe-bid-logo.png" alt="LuxeBid Logo" className="mx-auto w-40 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800">Welcome Back!</h2>
          <p className="text-gray-500 text-sm">Enter your credentials to access your dashboard.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email or Username
            </label>
            <input
              type="text"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={loading}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="********"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={loading}
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          {errors.general && (
            <p className="text-red-500 text-sm text-center">{errors.general}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-black text-white rounded-md hover:bg-gray-800 transition-colors duration-200 font-medium disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <p className="text-center text-sm mt-4">
            <button
              type="button"
              className="text-blue-600 hover:underline"
              disabled={loading}
              onClick={async () => {
                if (!formData.email.trim()) {
                  alert('Please enter your email before resetting the password.');
                  return;
                }

                try {
                  await axiosInstance.post('/users/forgot-password/', {
                    email: formData.email.trim(),
                  });

                  localStorage.setItem('resetEmail', formData.email.trim());

                  alert('✅ OTP sent to your email.');
                  navigate('/reset-password');
                } catch (error) {
                  console.error(error);
                  alert(
                    error.response?.data?.email?.[0] ||
                      'Failed to send OTP. Please try again.'
                  );
                }
              }}
            >
              Forgot Password?
            </button>
          </p>

          <p className="text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <a href="/signup" className="text-blue-600 font-semibold hover:underline">
              Sign Up
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;