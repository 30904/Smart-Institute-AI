import PropTypes from "prop-types";
import { useMemo, useState } from "react";

import { ActionsMenu, DataTable, FormDrawer, PageHeader, StatusBadge } from "@/components/ui";
import ProgramForm from "@/pages/settings/ProgramForm";

function ProgramList({ rows, loading, departments, canCreate, canEdit, onCreate, onUpdate }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const drawerTitle = useMemo(() => (selectedRow ? "Edit Program/Course" : "Create Program/Course"), [selectedRow]);
  const departmentById = useMemo(() => new Map(departments.map((department) => [department.id, department.name])), [departments]);

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
      setError(apiError?.response?.data?.message || "Failed to save program.");
    } finally {
      setSubmitting(false);
    }
  }

  const columns = [
    { key: "name", label: "Program/Course" },
    { key: "code", label: "Code" },
    { key: "department", label: "Department" },
    { key: "type", label: "Type" },
    { key: "duration", label: "Duration" },
    { key: "intake", label: "Intake" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions", align: "center" }
  ];

  const tableRows = rows.map((row) => ({
    id: row.id,
    name: row.name,
    code: row.code,
    department: departmentById.get(row.department_id) || "-",
    type: row.program_type,
    duration: `${row.duration} yr`,
    intake: row.intake_default,
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
        title="Program/Course Master"
        subtitle="Manage trade, diploma, and degree course definitions."
        actions={
          canCreate ? (
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                setSelectedRow(null);
                setDrawerOpen(true);
              }}
            >
              Add Program
            </button>
          ) : null
        }
      />
      {error ? <p className="ui-error-text">{error}</p> : null}
      {loading ? <p>Loading programs...</p> : <DataTable columns={columns} rows={tableRows} emptyMessage="No programs found." />}

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
        <ProgramForm
          initialValue={selectedRow}
          departments={departments}
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

ProgramList.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
  departments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    })
  ).isRequired,
  canCreate: PropTypes.bool.isRequired,
  canEdit: PropTypes.bool.isRequired,
  onCreate: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired
};

export default ProgramList;
