import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getBuyerProfile, getSellerProfile } from "../utils/api"; // both endpoints

const Navbar = ({ toggleSidebar }) => {
  const { tokens, logout, user } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [username, setUsername] = useState("User");
  const [profileImage, setProfileImage] = useState("/default-profile.png");
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch profile based on role
  useEffect(() => {
    const fetchProfile = async () => {
      if (!tokens?.access || !user?.role) return;
      try {
        let data;
        if (user.role === "buyer") {
          data = await getBuyerProfile(tokens.access);
        } else if (user.role === "seller") {
          data = await getSellerProfile(tokens.access);
        }

        setUsername(data?.full_name || data?.email || "User");
        if (data?.profile_image) setProfileImage(data.profile_image);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };

    fetchProfile();
  }, [tokens, user]);

  return (
    <nav className="h-16 bg-gray-800 text-white flex items-center justify-between px-4 shadow-md">
      {/* Left side */}
      <div className="flex items-center">
        <button className="mr-4 md:hidden" onClick={toggleSidebar}>
          ☰
        </button>
        <img src="/luxe-bid-logo.png" alt="Logo" className="w-36 h-auto" />
      </div>

      {/* Right side */}
      <div className="flex items-center relative" ref={dropdownRef}>
        <div className="flex items-center cursor-pointer" onClick={toggleDropdown}>
          <span className="mr-2 font-semibold">{username}</span>
          <img
            src={profileImage}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover border-2 border-white"
          />
        </div>
        {isDropdownOpen && (
          <div className="absolute right-0 mt-12 w-48 bg-white text-black rounded shadow-lg py-2 z-50">
            <button
              className="block w-full text-left px-4 py-2 hover:bg-gray-200"
              onClick={() => {
                navigate(user.role === "buyer" ? "/buyer/profile" : "/seller/profile");
                setIsDropdownOpen(false);
              }}
            >
              Profile
            </button>
            <button
              className="block w-full text-left px-4 py-2 hover:bg-gray-200"
              onClick={() => {
                navigate(user.role === "buyer" ? "/buyer/settings" : "/seller/settings");
                setIsDropdownOpen(false);
              }}
            >
              Settings
            </button>
            <button
              className="block w-full text-left px-4 py-2 hover:bg-gray-200"
              onClick={() => {
                navigate(user.role === "buyer" ? "/buyer/change-password" : "/seller/change-password");
                setIsDropdownOpen(false);
              }}
            >
              Change Password
            </button>
            <button
              className="block w-full text-left px-4 py-2 hover:bg-gray-200"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
