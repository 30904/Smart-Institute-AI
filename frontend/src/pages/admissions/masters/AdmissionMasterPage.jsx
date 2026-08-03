import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";

import {
  createAdmissionMaster,
  deleteAdmissionMaster,
  fetchAdmissionMasterOptions,
  fetchAdmissionMasters,
  updateAdmissionMaster
} from "@/api/core";
import usePermission from "@/hooks/usePermission";
import ModuleShell from "@/layout/ModuleShell";
import { getAdmissionMasterConfig } from "@/pages/admissions/masters/admissionMasterConfig";
import AdmissionMasterList from "@/pages/admissions/masters/AdmissionMasterList";

function AdmissionMasterPage() {
  const { resource } = useParams();
  const config = getAdmissionMasterConfig(resource);
  const { hasPermission } = usePermission();
  const canView = hasPermission("admissions", "view");
  const canCreate = hasPermission("admissions", "create");
  const canEdit = hasPermission("admissions", "edit");
  const canDelete = hasPermission("admissions", "delete");

  const [rows, setRows] = useState([]);
  const [optionSets, setOptionSets] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadRows() {
    const response = await fetchAdmissionMasters(resource);
    setRows(Array.isArray(response?.data) ? response.data : []);
  }

  useEffect(() => {
    if (!config || !canView) {
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        setError("");
        const sources = [...new Set(config.fields.map((field) => field.source).filter(Boolean))];
        const [rowsResponse, ...optionResponses] = await Promise.all([
          fetchAdmissionMasters(resource),
          ...sources.map((source) => fetchAdmissionMasterOptions(source))
        ]);

        setRows(Array.isArray(rowsResponse?.data) ? rowsResponse.data : []);
        setOptionSets(
          sources.reduce((sets, source, index) => {
            sets[source] = Array.isArray(optionResponses[index]?.data) ? optionResponses[index].data : [];
            return sets;
          }, {})
        );
      } catch (apiError) {
        setError(apiError?.response?.data?.message || `Failed to load ${config.plural.toLowerCase()}.`);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [resource, config, canView]);

  if (!config) return <Navigate to="/admissions/masters" replace />;

  if (!canView) {
    return (
      <main className="app-shell">
        <h3>Access denied</h3>
        <p>You do not have permission to view admission masters.</p>
      </main>
    );
  }

  async function handleCreate(payload) {
    await createAdmissionMaster(resource, payload);
    await loadRows();
  }

  async function handleUpdate(id, payload) {
    await updateAdmissionMaster(resource, id, payload);
    await loadRows();
  }

  async function handleDelete(id) {
    await deleteAdmissionMaster(resource, id);
    await loadRows();
  }

  return (
    <ModuleShell
      title="Admissions"
      subtitle="Manage applications, enrollment, and admission workflows."
    >
      {error ? <p className="ui-error-text">{error}</p> : null}
      <AdmissionMasterList
        config={config}
        rows={rows}
        optionSets={optionSets}
        loading={loading}
        canCreate={canCreate}
        canEdit={canEdit}
        canDelete={canDelete}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </ModuleShell>
  );
}

export default AdmissionMasterPage;
