// Create: src/components/AdminRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const AdminRoute = () => {
  const { user, isAuthenticated } = useAuth();

  // Check if user is authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has admin/staff access
  if (!user.is_staff && !user.is_superuser) {
    alert('Access Denied: You do not have administrator privileges');
    // Redirect based on their role
    if (user.role === "seller") {
      return <Navigate to="/seller-dashboard" replace />;
    } else if (user.role === "buyer") {
      return <Navigate to="/buyer-dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  // User is authenticated and has admin access
  return <Outlet />;
};

export default AdminRoute;