import { useEffect, useState } from "react";

import { createAcademicYear, fetchAcademicYears, setCurrentAcademicYear, updateAcademicYear } from "@/api/core";
import usePermission from "@/hooks/usePermission";
import AcademicYearList from "@/pages/settings/AcademicYearList";

function AcademicYearPage() {
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
      const response = await fetchAcademicYears();
      setRows(Array.isArray(response?.data) ? response.data : []);
      setError("");
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Failed to load academic years.");
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
    await createAcademicYear(payload);
    await loadRows();
  }

  async function handleUpdate(id, payload) {
    await updateAcademicYear(id, payload);
    await loadRows();
  }

  async function handleSetCurrent(id) {
    try {
      await setCurrentAcademicYear(id);
      await loadRows();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Failed to set current academic year.");
    }
  }

  if (!canView) {
    return (
      <main className="app-shell">
        <h3>Access denied</h3>
        <p>You do not have permission to view academic year settings.</p>
      </main>
    );
  }

  return (
    <>
      {error ? <p className="ui-error-text app-shell">{error}</p> : null}
      <AcademicYearList
        rows={rows}
        loading={loading}
        canCreate={canCreate}
        canEdit={canEdit}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onSetCurrent={handleSetCurrent}
      />
    </>
  );
}

export default AcademicYearPage;
