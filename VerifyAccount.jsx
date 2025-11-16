import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

const VerifyAccount = () => {
  const otpInputs = useRef([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  // Get email from localStorage on component mount
  useEffect(() => {
    const storedEmail = localStorage.getItem('emailForOtp');
    if (!storedEmail) {
      setError('Email not found. Please register again.');
    }
    setEmail(storedEmail);
  }, []);

  const handleInputChange = (index, event) => {
    const { value } = event.target;
    if (/^\d$/.test(value)) {
      event.target.value = value;
      if (index < otpInputs.current.length - 1) {
        otpInputs.current[index + 1].focus();
      }
    } else {
      event.target.value = '';
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !event.target.value && index > 0) {
      otpInputs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const otp = otpInputs.current.map((input) => input.value).join('');

    if (otp.length !== 6) {
      setError('Please enter all 6 digits of the OTP.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await axiosInstance.post('/users/verify-otp/', {
        otp,
        email,
      });

      console.log('OTP Verified:', response.data);

      // Clear stored email after successful verification
      localStorage.removeItem('emailForOtp');

      // Redirect to login or success page
      navigate('/success');
    } catch (err) {
      console.error('OTP Verification failed:', err.response?.data || err.message);
      setError(
        err.response?.data?.detail ||
          err.response?.data?.email?.[0] ||
          'Invalid or expired OTP. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

const [resending, setResending] = useState(false);

const handleResendOTP = async () => {
  const email = localStorage.getItem('emailForOtp'); // You stored this during registration

  if (!email) {
    setError('Email not found. Please register again.');
    return;
  }

  try {
    setResending(true);
    setError('');

    const response = await axiosInstance.post('/users/resend-otp/', { email });

    console.log('OTP resent:', response.data);
    // Optionally show a success toast or message
  } catch (err) {
    console.error('Resend OTP failed:', err.response?.data || err.message);
    setError(err.response?.data?.detail || 'Failed to resend OTP.');
  } finally {
    setResending(false);
  }
};

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#e6e9e6]">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md border border-gray-200 text-center">
        <div className="mb-6">
          <img src="/luxe-bid-logo.png" alt="LuxeBid Logo" className="mx-auto w-40 mb-8" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Account</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            We've sent a 6-digit code to your email <span className="font-medium text-black">{email}</span>.
            <br />
            Please enter it below to confirm your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center space-x-2">
            {[...Array(6)].map((_, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                inputMode="numeric"
                className="w-10 h-10 text-center text-lg font-bold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ref={(el) => (otpInputs.current[index] = el)}
                onChange={(e) => handleInputChange(index, e)}
                onKeyDown={(e) => handleKeyDown(index, e)}
              />
            ))}
          </div>

          {error && (
            <p className="text-sm text-red-600 mt-2 font-medium">{error}</p>
          )}

          <p className="text-sm mt-4">
            <button
              type="button"
              onClick={handleResendOTP}
              className="text-blue-600 hover:underline font-medium"
              disabled={resending}
            >
              {resending ? 'Resending...' : 'Resend OTP'}
            </button>
          </p>

          <button
            type="submit"
            className="w-full py-2.5 bg-black text-white rounded-md hover:bg-gray-800 transition-colors duration-200 font-medium"
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyAccount;
