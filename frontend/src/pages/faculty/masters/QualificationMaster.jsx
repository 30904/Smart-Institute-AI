import { useEffect, useMemo, useState } from "react";
import { DataTable, FormDrawer, PageHeader, StatusBadge } from "@/components/ui";
import { fetchQualificationMasters, createQualificationMaster, updateQualificationMaster } from "@/api/academic";
import usePermission from "@/hooks/usePermission";

const INITIAL_FORM = { name: "", code: "", level: "", is_active: true };

export default function QualificationMaster() {
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

  const drawerTitle = useMemo(() => (selectedRow ? "Edit Qualification" : "Create Qualification"), [selectedRow]);

  async function loadRows() {
    try {
      setLoading(true);
      const response = await fetchQualificationMasters();
      setRows(Array.isArray(response?.data) ? response.data : []);
      setError("");
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Failed to load qualifications.");
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
      setForm({ name: row.name, code: row.code, level: row.level || "", is_active: row.is_active });
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
      const payload = { ...form, name: form.name.trim(), code: form.code.trim(), level: form.level.trim() };
      
      if (selectedRow) {
        await updateQualificationMaster(selectedRow._id, payload);
      } else {
        await createQualificationMaster(payload);
      }
      
      setDrawerOpen(false);
      setSelectedRow(null);
      await loadRows();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Failed to save qualification.");
    } finally {
      setSubmitting(false);
    }
  }

  const columns = [
    { key: "name", label: "Name" },
    { key: "code", label: "Code" },
    { key: "level", label: "Level" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions" }
  ];

  const tableRows = rows.map((row) => ({
    id: row._id,
    name: row.name,
    code: row.code,
    level: row.level || "-",
    status: row.is_active ? <StatusBadge label="Active" tone="success" /> : <StatusBadge label="Inactive" tone="warning" />,
    actions: canEdit ? (
      <button type="button" className="btn-link" onClick={() => handleOpenForm(row)}>Edit</button>
    ) : <span>-</span>
  }));

  if (!canView) {
    return (
      <main className="app-shell">
        <h3>Access denied</h3>
        <p>You do not have permission to view qualifications.</p>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <PageHeader
        title="Qualification Master"
        subtitle="Configure faculty qualifications and education levels."
        actions={
          canCreate ? (
            <button type="button" className="btn-primary" onClick={() => handleOpenForm()}>
              Add Qualification
            </button>
          ) : null
        }
      />
      
      {error && <p className="ui-error-text">{error}</p>}
      {loading ? <p>Loading qualifications...</p> : <DataTable columns={columns} rows={tableRows} emptyMessage="No qualifications found." />}

      <FormDrawer
        title={drawerTitle}
        open={drawerOpen}
        onClose={() => { if (!submitting) setDrawerOpen(false); }}
      >
        <form className="ui-form-grid" onSubmit={handleSubmit}>
          <label>
            Name
            <input required name="name" value={form.name} onChange={handleFormChange} placeholder="e.g., Ph.D. in Computer Science" />
          </label>
          <label>
            Code
            <input required name="code" value={form.code} onChange={handleFormChange} placeholder="e.g., PHD-CS" />
          </label>
          <label>
            Level
            <select name="level" value={form.level} onChange={handleFormChange}>
              <option value="">Select Level</option>
              <option value="Doctorate">Doctorate</option>
              <option value="Post-Graduate">Post-Graduate</option>
              <option value="Undergraduate">Undergraduate</option>
              <option value="Certification">Certification</option>
              <option value="Diploma">Diploma</option>
            </select>
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
