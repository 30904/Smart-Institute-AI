import { useEffect, useState } from "react";
import { DataTable, PageHeader, StatusBadge } from "@/components/ui";
import { fetchAttendanceRecords } from "@/api/academic";
import usePermission from "@/hooks/usePermission";
import dayjs from "dayjs";

export default function FacultyAttendanceReport() {
  const { hasPermission } = usePermission();
  const canView = hasPermission("faculty", "view");

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filterMonth, setFilterMonth] = useState(dayjs().format("YYYY-MM"));

  async function loadRecords() {
    try {
      setLoading(true);
      const startOfMonth = dayjs(filterMonth).startOf("month").format("YYYY-MM-DD");
      const endOfMonth = dayjs(filterMonth).endOf("month").format("YYYY-MM-DD");
      
      const response = await fetchAttendanceRecords({ startDate: startOfMonth, endDate: endOfMonth });
      setRows(Array.isArray(response?.data) ? response.data : []);
      setError("");
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Failed to load attendance records.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (canView) loadRecords();
    else setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canView, filterMonth]);

  const columns = [
    { key: "date", label: "Date" },
    { key: "faculty", label: "Faculty Name" },
    { key: "punch_in", label: "Punch In" },
    { key: "punch_out", label: "Punch Out" },
    { key: "status", label: "Status" }
  ];

  const getStatusTone = (status) => {
    switch (status) {
      case "Present": return "success";
      case "Half-Day": return "warning";
      case "Absent": return "critical";
      case "Missing Punch": return "warning";
      default: return "neutral";
    }
  };

  const tableRows = rows.map((row) => ({
    id: row._id,
    date: dayjs(row.date).format("MMM DD, YYYY"),
    faculty: row.faculty_id ? `${row.faculty_id.firstName} ${row.faculty_id.lastName}` : "-",
    punch_in: row.punch_in_time ? dayjs(row.punch_in_time).format("hh:mm A") : "-",
    punch_out: row.punch_out_time ? dayjs(row.punch_out_time).format("hh:mm A") : "-",
    status: <StatusBadge label={row.status} tone={getStatusTone(row.status)} />
  }));

  if (!canView) {
    return (
      <main className="app-shell">
        <h3>Access denied</h3>
        <p>You do not have permission to view attendance records.</p>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <PageHeader
        title="Faculty Attendance Report"
        subtitle="View historical attendance records."
        actions={
          <input 
            type="month" 
            value={filterMonth} 
            onChange={(e) => setFilterMonth(e.target.value)} 
            style={{ padding: "8px", borderRadius: "4px", border: "1px solid var(--border)" }}
          />
        }
      />
      
      {error && <p className="ui-error-text">{error}</p>}
      {loading ? <p>Loading records...</p> : <DataTable columns={columns} rows={tableRows} emptyMessage="No records found for this month." />}
    </main>
  );
}
