import PropTypes from "prop-types";
import { useMemo, useState } from "react";

import { ActionsMenu, DataTable, FormDrawer, PageHeader, StatusBadge } from "@/components/ui";
import DepartmentForm from "@/pages/settings/DepartmentForm";

function DepartmentList({ rows, loading, canCreate, canEdit, onCreate, onUpdate }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const drawerTitle = useMemo(() => (selectedRow ? "Edit Department" : "Create Department"), [selectedRow]);

  async function handleSave(payload) {
    try {
      setSubmitting(true);
      setError("");
      if (selectedRow) {
        await onUpdate(selectedRow.id, payload);
      } else {
        await onCreate(payload);
      }
      setDrawerOpen(false);
      setSelectedRow(null);
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Failed to save department.");
    } finally {
      setSubmitting(false);
    }
  }

  const columns = [
    { key: "name", label: "Name" },
    { key: "code", label: "Code" },
    { key: "head", label: "Head User ID" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions" }
  ];

  const tableRows = rows.map((row) => ({
    id: row.id,
    name: row.name,
    code: row.code,
    head: row.head_user_id || "-",
    status: row.is_active ? <StatusBadge label="Active" tone="success" /> : <StatusBadge label="Inactive" tone="warning" />,
    actions: (
      <ActionsMenu
        ariaLabel={`Actions for ${row.name}`}
        items={[
          {
            key: "edit",
            label: "Edit",
            hidden: !canEdit,
            onClick: () => {
              setSelectedRow(row);
              setDrawerOpen(true);
            }
          }
        ]}
      />
    )
  }));

  return (
    <main className="app-shell">
      <PageHeader
        title="Department Master"
        subtitle="Configure departments and optional department heads."
        actions={
          canCreate ? (
            <button type="button" className="btn-primary" onClick={() => { setSelectedRow(null); setDrawerOpen(true); }}>
              Add Department
            </button>
          ) : null
        }
      />
      {error ? <p className="ui-error-text">{error}</p> : null}
      {loading ? <p>Loading departments...</p> : <DataTable columns={columns} rows={tableRows} emptyMessage="No departments found." />}

      <FormDrawer
        title={drawerTitle}
        open={drawerOpen}
        onClose={() => {
          if (!submitting) {
            setDrawerOpen(false);
            setSelectedRow(null);
          }
        }}
      >
        <DepartmentForm
          initialValue={selectedRow}
          submitting={submitting}
          onSubmit={handleSave}
          onCancel={() => {
            if (!submitting) {
              setDrawerOpen(false);
              setSelectedRow(null);
            }
          }}
        />
      </FormDrawer>
    </main>
  );
}

DepartmentList.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
  canCreate: PropTypes.bool.isRequired,
  canEdit: PropTypes.bool.isRequired,
  onCreate: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired
};

export default DepartmentList;
