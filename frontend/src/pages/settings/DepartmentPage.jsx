import { useEffect, useState } from "react";

import { createDepartment, fetchDepartments, updateDepartment } from "@/api/core";
import usePermission from "@/hooks/usePermission";
import DepartmentList from "@/pages/settings/DepartmentList";

function DepartmentPage() {
  const { hasPermission } = usePermission();
  const canView = hasPermission("settings", "view");
  const canCreate = hasPermission("settings", "create");
  const canEdit = hasPermission("settings", "edit");

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadRows() {
    try {
      setLoading(true);
      const response = await fetchDepartments();
      setRows(Array.isArray(response?.data) ? response.data : []);
      setError("");
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Failed to load departments.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (canView) {
      loadRows();
      return;
    }
    setLoading(false);
  }, [canView]);

  async function handleCreate(payload) {
    await createDepartment(payload);
    await loadRows();
  }

  async function handleUpdate(id, payload) {
    await updateDepartment(id, payload);
    await loadRows();
  }

  if (!canView) {
    return (
      <main className="app-shell">
        <h3>Access denied</h3>
        <p>You do not have permission to view department settings.</p>
      </main>
    );
  }

  return (
    <>
      {error ? <p className="ui-error-text app-shell">{error}</p> : null}
      <DepartmentList rows={rows} loading={loading} canCreate={canCreate} canEdit={canEdit} onCreate={handleCreate} onUpdate={handleUpdate} />
    </>
  );
}

export default DepartmentPage;
