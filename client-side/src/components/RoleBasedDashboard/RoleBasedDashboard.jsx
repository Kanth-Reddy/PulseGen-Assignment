import { useAuth } from "../../contexts/AuthContext";
import Dashboard from "../../pages/Dashboard/Dashboard";
import AdminDashboard from "../../pages/AdminDashboard/AdminDashboard";

const RoleBasedDashboard = () => {
  const { user } = useAuth();

  // Check if user is admin
  if (user?.role === "admin") {
    return <AdminDashboard />;
  }

  // Return regular dashboard for other roles (viewer, editor, etc.)
  return <Dashboard />;
};

export default RoleBasedDashboard;

