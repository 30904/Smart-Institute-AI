import { useMemo, useState } from "react";
import PropTypes from "prop-types";

import { ActionsMenu, DataTable, FormDrawer, PageHeader, StatusBadge } from "@/components/ui";
import AcademicYearForm from "@/pages/settings/AcademicYearForm";

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
}

function AcademicYearList({ rows, loading, canCreate, canEdit, onCreate, onUpdate, onSetCurrent }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const drawerTitle = useMemo(() => (selectedRow ? "Edit Academic Year" : "Create Academic Year"), [selectedRow]);

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
      setError(apiError?.response?.data?.message || "Failed to save academic year.");
    } finally {
      setSubmitting(false);
    }
  }

  function openCreate() {
    setSelectedRow(null);
    setDrawerOpen(true);
  }

  function openEdit(row) {
    setSelectedRow(row);
    setDrawerOpen(true);
  }

  const columns = [
    { key: "name", label: "Name" },
    { key: "code", label: "Code" },
    { key: "period", label: "Period" },
    { key: "status", label: "Status" },
    { key: "active", label: "Active" },
    { key: "actions", label: "Actions" }
  ];

  const tableRows = rows.map((row) => ({
    id: row.id,
    name: row.name,
    code: row.code,
    period: `${formatDate(row.start_date)} - ${formatDate(row.end_date)}`,
    status: row.is_current ? <StatusBadge label="Current" tone="info" /> : <StatusBadge label="Standard" tone="neutral" />,
    active: row.is_active ? <StatusBadge label="Active" tone="success" /> : <StatusBadge label="Inactive" tone="warning" />,
    actions: (
      <ActionsMenu
        ariaLabel={`Actions for ${row.name}`}
        items={[
          {
            key: "edit",
            label: "Edit",
            hidden: !canEdit,
            onClick: () => openEdit(row)
          },
          {
            key: "set-current",
            label: "Set Current",
            hidden: !(canEdit && !row.is_current),
            onClick: () => onSetCurrent(row.id)
          }
        ]}
      />
    )
  }));

  return (
    <main className="app-shell">
      <PageHeader
        title="Academic Year Master"
        subtitle="Configure academic year definitions and set current context."
        actions={
          canCreate ? (
            <button type="button" className="btn-primary" onClick={openCreate}>
              Add Academic Year
            </button>
          ) : null
        }
      />
      {error ? <p className="ui-error-text">{error}</p> : null}
      {loading ? <p>Loading academic years...</p> : <DataTable columns={columns} rows={tableRows} emptyMessage="No academic years found." />}

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
        <AcademicYearForm
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

AcademicYearList.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
  canCreate: PropTypes.bool.isRequired,
  canEdit: PropTypes.bool.isRequired,
  onCreate: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onSetCurrent: PropTypes.func.isRequired
};

export default AcademicYearList;
