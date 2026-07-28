import PropTypes from "prop-types";
import { createContext, useCallback, useEffect, useMemo, useState } from "react";

import { fetchCurrentUser } from "@/api/core";

const PermissionContext = createContext(null);

function PermissionProvider({ children }) {
  const [user, setUser] = useState(null);
  const [permissionMatrix, setPermissionMatrix] = useState({});
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setUser(null);
      setPermissionMatrix({});
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetchCurrentUser();
      const me = response?.data || null;
      setUser(me);
      setPermissionMatrix(me?.permission_matrix || {});
    } catch {
      localStorage.removeItem("authToken");
      setUser(null);
      setPermissionMatrix({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const hasPermission = useCallback(
    (moduleName, action = "view") => Boolean(permissionMatrix?.[moduleName]?.[action]),
    [permissionMatrix]
  );

  const value = useMemo(
    () => ({
      user,
      permissionMatrix,
      loading,
      hasPermission,
      refreshSession
    }),
    [hasPermission, loading, permissionMatrix, refreshSession, user]
  );

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
}

PermissionProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export { PermissionContext, PermissionProvider };
