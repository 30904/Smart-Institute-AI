import { useEffect, useMemo, useState } from "react";
import { DataTable, FormDrawer, PageHeader, StatusBadge } from "@/components/ui";
import { fetchSubjects, createSubject, updateSubject } from "@/api/academic";
import { fetchDepartments } from "@/api/core";
import usePermission from "@/hooks/usePermission";

const INITIAL_FORM = { name: "", code: "", department: "", credits: 0, is_active: true };

export default function SubjectMaster() {
  const { hasPermission } = usePermission();
  const canView = hasPermission("faculty", "view");
  const canCreate = hasPermission("faculty", "create");
  const canEdit = hasPermission("faculty", "edit");

  const [rows, setRows] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);

  const drawerTitle = useMemo(() => (selectedRow ? "Edit Subject" : "Create Subject"), [selectedRow]);

  async function loadData() {
    try {
      setLoading(true);
      const [subjRes, deptRes] = await Promise.all([
        fetchSubjects(),
        fetchDepartments()
      ]);
      setRows(Array.isArray(subjRes?.data) ? subjRes.data : []);
      setDepartments(Array.isArray(deptRes?.data) ? deptRes.data : []);
      setError("");
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Failed to load subjects.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (canView) loadData();
    else setLoading(false);
  }, [canView]);

  function handleOpenForm(row = null) {
    setSelectedRow(row);
    if (row) {
      setForm({ 
        name: row.name, 
        code: row.code, 
        department: row.department?._id || row.department || "", 
        credits: row.credits || 0,
        is_active: row.is_active 
      });
    } else {
      setForm(INITIAL_FORM);
    }
    setDrawerOpen(true);
  }

  function handleFormChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ 
      ...prev, 
      [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value 
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      const payload = { 
        ...form, 
        name: form.name.trim(), 
        code: form.code.trim(),
        department: form.department || null
      };
      
      if (selectedRow) {
        await updateSubject(selectedRow._id, payload);
      } else {
        await createSubject(payload);
      }
      
      setDrawerOpen(false);
      setSelectedRow(null);
      await loadData();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Failed to save subject.");
    } finally {
      setSubmitting(false);
    }
  }

  const columns = [
    { key: "name", label: "Name" },
    { key: "code", label: "Code" },
    { key: "department", label: "Department" },
    { key: "credits", label: "Credits" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions" }
  ];

  const tableRows = rows.map((row) => ({
    id: row._id,
    name: row.name,
    code: row.code,
    department: row.department?.name || "-",
    credits: row.credits || 0,
    status: row.is_active ? <StatusBadge label="Active" tone="success" /> : <StatusBadge label="Inactive" tone="warning" />,
    actions: canEdit ? (
      <button type="button" className="btn-link" onClick={() => handleOpenForm(row)}>Edit</button>
    ) : <span>-</span>
  }));

  if (!canView) {
    return (
      <main className="app-shell">
        <h3>Access denied</h3>
        <p>You do not have permission to view subjects.</p>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <PageHeader
        title="Subject Master"
        subtitle="Manage academic subjects and their assigned departments."
        actions={
          canCreate ? (
            <button type="button" className="btn-primary" onClick={() => handleOpenForm()}>
              Add Subject
            </button>
          ) : null
        }
      />
      
      {error && <p className="ui-error-text">{error}</p>}
      {loading ? <p>Loading subjects...</p> : <DataTable columns={columns} rows={tableRows} emptyMessage="No subjects found." />}

      <FormDrawer
        title={drawerTitle}
        open={drawerOpen}
        onClose={() => { if (!submitting) setDrawerOpen(false); }}
      >
        <form className="ui-form-grid" onSubmit={handleSubmit}>
          <label>
            Name
            <input required name="name" value={form.name} onChange={handleFormChange} placeholder="e.g., Data Structures" />
          </label>
          <label>
            Code
            <input required name="code" value={form.code} onChange={handleFormChange} placeholder="e.g., CS201" />
          </label>
          <label>
            Department
            <select name="department" value={form.department} onChange={handleFormChange}>
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept.id || dept._id} value={dept.id || dept._id}>
                  {dept.name} ({dept.code})
                </option>
              ))}
            </select>
          </label>
          <label>
            Credits
            <input type="number" required name="credits" value={form.credits} onChange={handleFormChange} min="0" step="0.5" />
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
