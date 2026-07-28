import usePermission from "@/hooks/usePermission";
import SharedMastersHub from "@/pages/settings/SharedMastersHub";

function SharedMastersPage() {
  const { hasPermission } = usePermission();
  const canView = hasPermission("settings", "view");

  if (!canView) {
    return (
      <main className="app-shell">
        <h3>Access denied</h3>
        <p>You do not have permission to view shared platform masters.</p>
      </main>
    );
  }

  return <SharedMastersHub />;
}

export default SharedMastersPage;
