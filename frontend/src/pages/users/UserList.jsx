import PropTypes from "prop-types";

import { DataTable, PageHeader, StatusBadge } from "@/components/ui";

function UserList({ users, canCreate, canEdit, onCreate, onEdit, onDeactivate }) {
  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions" }
  ];

  const rows = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role || "-",
    status: <StatusBadge label={user.is_active ? "Active" : "Inactive"} tone={user.is_active ? "success" : "warning"} />,
    actions: (
      <div className="ui-inline-actions">
        {canEdit ? (
          <button type="button" className="btn-link" onClick={() => onEdit(user)}>
            Edit
          </button>
        ) : (
          <span>-</span>
        )}
        {canEdit && user.is_active ? (
          <button type="button" className="btn-link danger" onClick={() => onDeactivate(user)}>
            Deactivate
          </button>
        ) : null}
      </div>
    )
  }));

  return (
    <>
      <PageHeader
        title="User Management"
        subtitle="Manage institution users with role-based access controls."
        actions={
          canCreate ? (
            <button type="button" className="btn-primary" onClick={onCreate}>
              Add User
            </button>
          ) : null
        }
      />
      <DataTable columns={columns} rows={rows} emptyMessage="No users found." />
    </>
  );
}

UserList.propTypes = {
  users: PropTypes.arrayOf(PropTypes.object).isRequired,
  canCreate: PropTypes.bool.isRequired,
  canEdit: PropTypes.bool.isRequired,
  onCreate: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDeactivate: PropTypes.func.isRequired
};

export default UserList;
