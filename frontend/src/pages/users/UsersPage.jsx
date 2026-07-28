import { useEffect, useMemo, useState } from "react";

import { createUser, deactivateUser, fetchUsers, updateUser } from "@/api/core";
import { FormDrawer } from "@/components/ui";
import usePermission from "@/hooks/usePermission";
import UserForm from "@/pages/users/UserForm";
import UserList from "@/pages/users/UserList";

function UsersPage() {
  const { hasPermission } = usePermission();
  const canView = hasPermission("users", "view");
  const canCreate = hasPermission("users", "create");
  const canEdit = hasPermission("users", "edit");

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const drawerTitle = useMemo(() => (selectedUser ? "Edit User" : "Create User"), [selectedUser]);

  async function loadUsers() {
    try {
      setLoading(true);
      const response = await fetchUsers();
      setUsers(Array.isArray(response?.data) ? response.data : []);
      setError("");
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (canView) {
      loadUsers();
      return;
    }
    setLoading(false);
  }, [canView]);

  function openCreate() {
    setSelectedUser(null);
    setDrawerOpen(true);
  }

  function openEdit(user) {
    setSelectedUser(user);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    if (!submitting) {
      setDrawerOpen(false);
      setSelectedUser(null);
    }
  }

  async function handleSubmit(payload) {
    try {
      setSubmitting(true);
      if (selectedUser) {
        await updateUser(selectedUser.id, payload);
      } else {
        await createUser(payload);
      }
      closeDrawer();
      await loadUsers();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Failed to save user.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeactivate(user) {
    try {
      await deactivateUser(user.id);
      await loadUsers();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Failed to deactivate user.");
    }
  }

  if (!canView) {
    return (
      <main className="app-shell">
        <h3>Access denied</h3>
        <p>You do not have permission to view user management.</p>
      </main>
    );
  }

  return (
    <main className="app-shell">
      {error ? <p className="ui-error-text">{error}</p> : null}
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <UserList
          users={users}
          canCreate={canCreate}
          canEdit={canEdit}
          onCreate={openCreate}
          onEdit={openEdit}
          onDeactivate={handleDeactivate}
        />
      )}

      <FormDrawer title={drawerTitle} open={drawerOpen} onClose={closeDrawer}>
        <UserForm initialValue={selectedUser} submitting={submitting} onSubmit={handleSubmit} onCancel={closeDrawer} />
      </FormDrawer>
    </main>
  );
}

export default UsersPage;
