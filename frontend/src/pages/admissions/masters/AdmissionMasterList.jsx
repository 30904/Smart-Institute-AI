import PropTypes from "prop-types";
import { useMemo, useState } from "react";

import { ActionsMenu, DataTable, FormDrawer, PageHeader, StatusBadge } from "@/components/ui";
import AdmissionMasterForm from "@/pages/admissions/masters/AdmissionMasterForm";

function getOptionLabel(field, value, optionSets) {
  const options = field.options || optionSets[field.source] || [];
  return options.find((option) => option.value === String(value))?.label || value || "-";
}

function formatValue(field, value, optionSets) {
  if (field.type === "checkbox") {
    return value ? <StatusBadge label="Active / Yes" tone="success" /> : <StatusBadge label="Inactive / No" tone="warning" />;
  }
  if (field.type === "date") {
    return value ? new Date(value).toLocaleDateString() : "-";
  }
  if (field.type === "select") {
    return getOptionLabel(field, value, optionSets);
  }
  if (field.type === "multiselect") {
    return value?.length ? value.map((item) => getOptionLabel(field, item, optionSets)).join(", ") : "All programs";
  }
  if (field.type === "json") {
    const text = JSON.stringify(value || {});
    return text.length > 70 ? `${text.slice(0, 67)}...` : text;
  }
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

function AdmissionMasterList({ config, rows, optionSets, loading, canCreate, canEdit, canDelete, onCreate, onUpdate, onDelete }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fieldsByName = useMemo(() => new Map(config.fields.map((field) => [field.name, field])), [config]);
  const columns = useMemo(
    () => [
      ...config.columns.map((key) => ({ key, label: fieldsByName.get(key)?.label || key })),
      { key: "actions", label: "Actions", align: "center" }
    ],
    [config, fieldsByName]
  );

  const tableRows = rows.map((row) => {
    const formatted = { id: row.id };
    config.columns.forEach((key) => {
      formatted[key] = formatValue(fieldsByName.get(key) || {}, row[key], optionSets);
    });
    formatted.actions = (
      <ActionsMenu
        ariaLabel={`Actions for ${config.title.toLowerCase()}`}
        items={[
          {
            key: "edit",
            label: "Edit",
            hidden: !canEdit,
            onClick: () => {
              setSelectedRow(row);
              setDrawerOpen(true);
            }
          },
          {
            key: "delete",
            label: "Delete",
            tone: "danger",
            hidden: !canDelete,
            onClick: async () => {
              if (!window.confirm(`Delete this ${config.title.toLowerCase()}?`)) return;
              try {
                setError("");
                await onDelete(row.id);
              } catch (apiError) {
                setError(apiError?.response?.data?.message || `Failed to delete ${config.title.toLowerCase()}.`);
              }
            }
          }
        ]}
      />
    );
    return formatted;
  });

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
      setError(apiError?.response?.data?.message || `Failed to save ${config.title.toLowerCase()}.`);
    } finally {
      setSubmitting(false);
    }
  }

  function closeDrawer() {
    if (submitting) return;
    setDrawerOpen(false);
    setSelectedRow(null);
  }

  return (
    <>
      <PageHeader
        title={`${config.title} Master`}
        subtitle={config.description}
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
              Add {config.title}
            </button>
          ) : null
        }
      />
      {error ? <p className="ui-error-text">{error}</p> : null}
      {loading ? <p>Loading {config.plural.toLowerCase()}...</p> : <DataTable columns={columns} rows={tableRows} emptyMessage={`No ${config.plural.toLowerCase()} found.`} />}

      <FormDrawer
        title={`${selectedRow ? "Edit" : "Create"} ${config.title}`}
        open={drawerOpen}
        onClose={closeDrawer}
      >
        <AdmissionMasterForm
          config={config}
          initialValue={selectedRow}
          optionSets={optionSets}
          submitting={submitting}
          onSubmit={handleSave}
          onCancel={closeDrawer}
        />
      </FormDrawer>
    </>
  );
}

AdmissionMasterList.propTypes = {
  config: PropTypes.object.isRequired,
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  optionSets: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  canCreate: PropTypes.bool.isRequired,
  canEdit: PropTypes.bool.isRequired,
  canDelete: PropTypes.bool.isRequired,
  onCreate: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

export default AdmissionMasterList;
