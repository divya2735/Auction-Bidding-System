// File: components/LandingNavbar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Menu, X, LogOut, User } from 'lucide-react';

const LandingNavbar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">A</span>
            </div>
            <span className="font-bold text-xl text-gray-900">LuxeBid</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#featured" className="text-gray-600 hover:text-gray-900 transition-colors">
              Featured
            </a>
            <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">
              How it Works
            </a>
            <button 
              onClick={() => navigate('/browse')}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Browse Auctions
            </button>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-medium"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Sign Up
                </button>
              </div>
            

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div ref={menuRef} className="md:hidden mt-4 pt-4 border-t border-gray-200 space-y-3">
            <a
              href="#featured"
              className="block text-gray-600 hover:text-gray-900 transition-colors py-2"
            >
              Featured
            </a>
            <a
              href="#how-it-works"
              className="block text-gray-600 hover:text-gray-900 transition-colors py-2"
            >
              How it Works
            </a>
            <button
              onClick={() => {
                navigate('/browse');
                setIsMenuOpen(false);
              }}
              className="block w-full text-left text-gray-600 hover:text-gray-900 transition-colors py-2"
            >
              Browse Auctions
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default LandingNavbar;