import { useEffect, useMemo, useState } from "react";
import { DataTable, FormDrawer, PageHeader, StatusBadge } from "@/components/ui";
import { fetchDesignations, createDesignation, updateDesignation } from "@/api/academic";
import usePermission from "@/hooks/usePermission";

const INITIAL_FORM = { name: "", code: "", is_active: true };

export default function DesignationMaster() {
  const { hasPermission } = usePermission();
  const canView = hasPermission("faculty", "view");
  const canCreate = hasPermission("faculty", "create");
  const canEdit = hasPermission("faculty", "edit");

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);

  const drawerTitle = useMemo(() => (selectedRow ? "Edit Designation" : "Create Designation"), [selectedRow]);

  async function loadRows() {
    try {
      setLoading(true);
      const response = await fetchDesignations();
      setRows(Array.isArray(response?.data) ? response.data : []);
      setError("");
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Failed to load designations.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (canView) loadRows();
    else setLoading(false);
  }, [canView]);

  function handleOpenForm(row = null) {
    setSelectedRow(row);
    if (row) {
      setForm({ name: row.name, code: row.code, is_active: row.is_active });
    } else {
      setForm(INITIAL_FORM);
    }
    setDrawerOpen(true);
  }

  function handleFormChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      const payload = { ...form, name: form.name.trim(), code: form.code.trim() };
      
      if (selectedRow) {
        await updateDesignation(selectedRow._id, payload);
      } else {
        await createDesignation(payload);
      }
      
      setDrawerOpen(false);
      setSelectedRow(null);
      await loadRows();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Failed to save designation.");
    } finally {
      setSubmitting(false);
    }
  }

  const columns = [
    { key: "name", label: "Name" },
    { key: "code", label: "Code" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions" }
  ];

  const tableRows = rows.map((row) => ({
    id: row._id,
    name: row.name,
    code: row.code,
    status: row.is_active ? <StatusBadge label="Active" tone="success" /> : <StatusBadge label="Inactive" tone="warning" />,
    actions: canEdit ? (
      <button type="button" className="btn-link" onClick={() => handleOpenForm(row)}>Edit</button>
    ) : <span>-</span>
  }));

  if (!canView) {
    return (
      <main className="app-shell">
        <h3>Access denied</h3>
        <p>You do not have permission to view designations.</p>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <PageHeader
        title="Designation Master"
        subtitle="Configure faculty designations (e.g., Professor, Associate Professor)."
        actions={
          canCreate ? (
            <button type="button" className="btn-primary" onClick={() => handleOpenForm()}>
              Add Designation
            </button>
          ) : null
        }
      />
      
      {error && <p className="ui-error-text">{error}</p>}
      {loading ? <p>Loading designations...</p> : <DataTable columns={columns} rows={tableRows} emptyMessage="No designations found." />}

      <FormDrawer
        title={drawerTitle}
        open={drawerOpen}
        onClose={() => { if (!submitting) setDrawerOpen(false); }}
      >
        <form className="ui-form-grid" onSubmit={handleSubmit}>
          <label>
            Name
            <input required name="name" value={form.name} onChange={handleFormChange} placeholder="e.g., Professor" />
          </label>
          <label>
            Code
            <input required name="code" value={form.code} onChange={handleFormChange} placeholder="e.g., PROF" />
          </label>
          <label className="ui-checkbox">
            <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleFormChange} />
            Active
          </label>
          <div className="ui-form-actions">
            <button type="button" className="btn-secondary" onClick={() => setDrawerOpen(false)} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Saving..." : selectedRow ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </FormDrawer>
    </main>
  );
}
