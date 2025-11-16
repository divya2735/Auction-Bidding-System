import React, { useState } from "react";
import { NavLink } from "react-router-dom";

const Sidebar = ({ role, isOpen, toggle }) => {
  const [collapsed, setCollapsed] = useState(false);

  const linkClass = ({ isActive }) =>
    `flex items-center mb-2 p-2 rounded hover:bg-gray-700 transition-colors ${
      isActive ? "bg-gray-700 font-bold" : ""
    }`;

  const footerLinkClass = ({ isActive }) =>
    `flex items-center p-2 rounded hover:bg-gray-700 transition-colors text-sm ${
      isActive ? "bg-gray-700 font-bold" : "text-gray-400"
    }`;

  const iconDashboard = "🏠";
  const iconOrders = "📦";
  const iconProfile = "👤";

  return (
    <aside
      className={`bg-gray-900 text-white flex flex-col transition-all duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
        ${collapsed ? "w-20" : "w-64"} fixed md:relative h-full z-20`}
    >
      {/* Header */}
      <div className="p-4">
        <button
          className="mb-4 md:block hidden bg-gray-800 p-1 rounded w-full"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? "☰" : "Close"}
        </button>

        <button className="mb-4 md:hidden w-full" onClick={toggle}>
          Close
        </button>
      </div>

      {/* Main Navigation - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4">
        {/* Role-based links */}
        {role === "buyer" && (
  <>
    <NavLink to="/buyer-dashboard" className={linkClass}>
      <span className="mr-2">🏠</span>
      {!collapsed && "Dashboard"}
    </NavLink>

    {/* ✅ Dispute Menu for Buyer */}
    <NavLink to="/buyer/disputes" className={linkClass}>
      <span className="mr-2">⚠️</span>
      {!collapsed && "Disputes"}
    </NavLink>

    <NavLink to="/buyer/browse-auctions" className={linkClass}>
      <span className="mr-2">🔍</span>
      {!collapsed && "Browse Auctions"}
    </NavLink>
    <NavLink to="/buyer/watchlist" className={linkClass}>
      <span className="mr-2">⭐</span>
      {!collapsed && "Watchlist"}
    </NavLink>
    <NavLink to="/buyer/won-auctions" className={linkClass}>
      <span className="mr-2">🏆</span>
      {!collapsed && "Won Auctions"}
    </NavLink>
    <NavLink to="/buyer/completed-auctions" className={linkClass}>
      <span className="mr-2">✅</span>
      {!collapsed && "Completed Auctions"}
    </NavLink>
    <NavLink to="/transactions" className={linkClass}>
      <span className="mr-2">💳</span>
      {!collapsed && "Transactions"}
    </NavLink>
    <NavLink to="/buyer/profile" className={linkClass}>
      <span className="mr-2">👤</span>
      {!collapsed && "Profile"}
    </NavLink>
  </>
)}

{role === "seller" && (
  <>
    <NavLink to="/seller-dashboard" className={linkClass}>
      <span className="mr-2">🏠</span>
      {!collapsed && "Dashboard"}
    </NavLink>

    {/* ✅ Dispute Menu for Seller */}
    <NavLink to="/seller/disputes" className={linkClass}>
      <span className="mr-2">⚠️</span>
      {!collapsed && "Disputes"}
    </NavLink>

    <NavLink to="/seller/create-listing" className={linkClass}>
      <span className="mr-2">➕</span>
      {!collapsed && "Post An Auction"}
    </NavLink>
    <NavLink to="/seller/auctions" className={linkClass}>
      <span className="mr-2">📦</span>
      {!collapsed && "My Auctions"}
    </NavLink>
    <NavLink to="/seller/profile" className={linkClass}>
      <span className="mr-2">👤</span>
      {!collapsed && "Profile"}
    </NavLink>
  </>
)}

      </div>

      {/* Footer Links */}
      <div className="border-t border-gray-700 p-4 mt-auto">
        <NavLink to="/terms" className={footerLinkClass}>
          <span className="mr-2">📄</span>
          {!collapsed && "Terms & Conditions"}
        </NavLink>
        <NavLink to="/privacy-policy" className={footerLinkClass}>
          <span className="mr-2">🔒</span>
          {!collapsed && "Privacy Policy"}
        </NavLink>
        <NavLink to="/about" className={footerLinkClass}>
          <span className="mr-2">ℹ️</span>
          {!collapsed && "About Us"}
        </NavLink>

        {!collapsed && (
          <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-500 text-center">
            © 2025 LuxeBid
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;