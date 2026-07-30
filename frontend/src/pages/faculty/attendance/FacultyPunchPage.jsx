import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui";
import { fetchPunchStatus, punchIn, punchOut } from "@/api/academic";
import usePermission from "@/hooks/usePermission";
import dayjs from "dayjs";

export default function FacultyPunchPage() {
  const { hasPermission } = usePermission();
  const canPunch = hasPermission("faculty", "view"); // Using 'view' as baseline, ideally a specific 'punch' permission

  const [statusInfo, setStatusInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  async function loadStatus() {
    try {
      setLoading(true);
      const response = await fetchPunchStatus();
      setStatusInfo(response.data);
      setError("");
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Failed to load punch status.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (canPunch) loadStatus();
    else setLoading(false);
  }, [canPunch]);

  async function handlePunchIn() {
    try {
      setProcessing(true);
      await punchIn();
      await loadStatus();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Failed to punch in.");
    } finally {
      setProcessing(false);
    }
  }

  async function handlePunchOut() {
    try {
      setProcessing(true);
      await punchOut();
      await loadStatus();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Failed to punch out.");
    } finally {
      setProcessing(false);
    }
  }

  if (!canPunch) {
    return (
      <main className="app-shell">
        <h3>Access denied</h3>
        <p>You do not have permission to punch attendance.</p>
      </main>
    );
  }

  const { status, record } = statusInfo || {};
  const todayDateStr = dayjs().format("dddd, MMMM D, YYYY");

  return (
    <main className="app-shell">
      <PageHeader
        title="Daily Attendance Punch"
        subtitle={`Record your attendance for ${todayDateStr}`}
      />
      
      {error && <p className="ui-error-text">{error}</p>}
      
      {loading ? (
        <p>Loading status...</p>
      ) : (
        <div style={{ maxWidth: 500, padding: 24, border: "1px solid var(--border)", borderRadius: 8, marginTop: 16 }}>
          <h2 style={{ marginBottom: 16, fontSize: "1.25rem" }}>Current Status: <strong>{status}</strong></h2>
          
          {record && record.punch_in_time && (
            <p style={{ marginBottom: 8 }}>
              Punched In: {dayjs(record.punch_in_time).format("hh:mm A")}
            </p>
          )}
          
          {record && record.punch_out_time && (
            <p style={{ marginBottom: 16 }}>
              Punched Out: {dayjs(record.punch_out_time).format("hh:mm A")}
            </p>
          )}

          <div style={{ marginTop: 24, display: "flex", gap: 16 }}>
            <button 
              type="button" 
              className="btn-primary" 
              onClick={handlePunchIn}
              disabled={processing || status !== "Not Punched In"}
              style={{ flex: 1, padding: "16px", fontSize: "1.1rem" }}
            >
              {processing && status === "Not Punched In" ? "Processing..." : "Punch In"}
            </button>
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={handlePunchOut}
              disabled={processing || status !== "Punched In"}
              style={{ flex: 1, padding: "16px", fontSize: "1.1rem" }}
            >
              {processing && status === "Punched In" ? "Processing..." : "Punch Out"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
