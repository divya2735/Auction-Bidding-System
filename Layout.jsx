import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import PageWrapper from "./PageWrapper";

const Layout = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar role={user?.role} isOpen={sidebarOpen} toggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex flex-col">
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} logout={logout} />
        <main className="flex-1 p-4 overflow-auto">
          <PageWrapper>{children}</PageWrapper>
        </main>
      </div>
    </div>
  );
};

export default Layout;
