import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";

import usePermission from "@/hooks/usePermission";

function ProtectedRoute({ children, moduleName, action = "view" }) {
  const { loading, hasPermission } = usePermission();
  const token = localStorage.getItem("authToken");

  if (loading) {
    return <main className="app-shell">Checking permissions...</main>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (moduleName && !hasPermission(moduleName, action)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  moduleName: PropTypes.string,
  action: PropTypes.string
};

export default ProtectedRoute;
