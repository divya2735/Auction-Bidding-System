import React from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

const ProfileSuccess = () => {
  const navigate = useNavigate();
  const handleContinue = async (e) => {
  e.preventDefault();
  navigate('/login');

  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#e6e9e6]">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md border border-gray-200 text-center">
        <div className="mb-6">
          {/* LuxeBid Logo */}
          <img src="/luxe-bid-logo.png" alt="LuxeBid Logo" className="mx-auto w-40 mb-8" />
          
          {/* Checkmark icon - using a simple SVG for demonstration */}
          <div className="flex items-center justify-center mb-6">
            <div className="p-3 rounded-full bg-black text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Created Successfully!</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Your account has been successfully set up. <br />
            You can now proceed to your personalized dashboard.
          </p>
        </div>

        <button 
          type="button" // Use type="button" to prevent form submission if this was inside a form
          className="w-full py-2.5 bg-black text-white rounded-md hover:bg-gray-800 transition-colors duration-200 font-medium mt-4" onClick={handleContinue}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default ProfileSuccess;