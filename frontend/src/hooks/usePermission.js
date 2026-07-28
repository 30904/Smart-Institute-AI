import { useContext } from "react";

import { PermissionContext } from "@/context/PermissionContext";

function usePermission() {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error("usePermission must be used within PermissionProvider.");
  }
  return context;
}

export default usePermission;
