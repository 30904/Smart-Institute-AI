import { useEffect, useState } from "react";

import { createProgram, fetchDepartments, fetchPrograms, updateProgram } from "@/api/core";
import usePermission from "@/hooks/usePermission";
import ProgramList from "@/pages/settings/ProgramList";

function ProgramPage() {
  const { hasPermission } = usePermission();
  const canView = hasPermission("settings", "view");
  const canCreate = hasPermission("settings", "create");
  const canEdit = hasPermission("settings", "edit");

  const [rows, setRows] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      const [programRes, departmentRes] = await Promise.all([fetchPrograms(), fetchDepartments()]);
      setRows(Array.isArray(programRes?.data) ? programRes.data : []);
      setDepartments(Array.isArray(departmentRes?.data) ? departmentRes.data : []);
      setError("");
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Failed to load program data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (canView) {
      loadData();
      return;
    }
    setLoading(false);
  }, [canView]);

  async function handleCreate(payload) {
    await createProgram(payload);
    await loadData();
  }

  async function handleUpdate(id, payload) {
    await updateProgram(id, payload);
    await loadData();
  }

  if (!canView) {
    return (
      <main className="app-shell">
        <h3>Access denied</h3>
        <p>You do not have permission to view program settings.</p>
      </main>
    );
  }

  return (
    <>
      {error ? <p className="ui-error-text app-shell">{error}</p> : null}
      <ProgramList
        rows={rows}
        loading={loading}
        departments={departments}
        canCreate={canCreate}
        canEdit={canEdit}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />
    </>
  );
}

export default ProgramPage;
