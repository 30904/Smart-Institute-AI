import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Mock Data
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const PERIODS = ["09:00 AM", "10:00 AM", "11:15 AM", "12:15 PM", "02:00 PM", "03:00 PM"];

const MOCK_SCHEDULE = {
  Monday: {
    0: { subject: "Data Structures", faculty: "Dr. Smith", room: "Room 101", conflict: false },
    1: { subject: "Data Structures", faculty: "Dr. Smith", room: "Room 101", conflict: false },
    3: { subject: "Algorithms", faculty: "Prof. Davis", room: "Room 102", conflict: true, conflictReason: "Faculty Double-booked" },
    4: { subject: "Database Systems", faculty: "Dr. Wilson", room: "Room 205", conflict: false }
  },
  Tuesday: {
    1: { subject: "Operating Systems", faculty: "Dr. Brown", room: "Room 304", conflict: false },
    2: { subject: "Operating Systems", faculty: "Dr. Brown", room: "Room 304", conflict: false },
    5: { subject: "Computer Networks", faculty: "Prof. Miller", room: "Room 101", conflict: true, conflictReason: "Room Capacity Exceeded" }
  },
  Wednesday: {
    0: { subject: "Software Engineering", faculty: "Dr. Taylor", room: "Room 201", conflict: false },
    3: { subject: "Software Engineering", faculty: "Dr. Taylor", room: "Room 201", conflict: false }
  },
  Thursday: {
    2: { subject: "Machine Learning", faculty: "Dr. Anderson", room: "Lab 1", conflict: false },
    3: { subject: "Machine Learning", faculty: "Dr. Anderson", room: "Lab 1", conflict: false },
    4: { subject: "Cloud Computing", faculty: "Prof. Thomas", room: "Room 405", conflict: false }
  },
  Friday: {
    1: { subject: "Cyber Security", faculty: "Dr. White", room: "Room 302", conflict: false },
    2: { subject: "Artificial Intelligence", faculty: "Prof. Clark", room: "Room 105", conflict: true, conflictReason: "Faculty on Leave" }
  }
};

function TimetableGeneration() {
  const navigate = useNavigate();
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  const handlePublish = () => {
    setPublishing(true);
    setTimeout(() => {
      setPublishing(false);
      setPublished(true);
    }, 1000);
  };

  return (
    <main className="app-shell">
      <header className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <button className="back-link" onClick={() => navigate("/academics")} style={{ background: "none", border: "none", color: "#1d4ed8", cursor: "pointer", fontSize: "0.85rem", fontWeight: "600", padding: 0, marginBottom: "0.5rem", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
            ← Back to Academics
          </button>
          <h2 style={{ margin: 0, fontSize: "1.5rem", color: "#0f172a" }}>Timetable Generation</h2>
          <p style={{ margin: "0.25rem 0 0", color: "#64748b", fontSize: "0.9rem" }}>Generate class schedules and resolve resource conflicts.</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button className="ui-btn-secondary" style={{ padding: "0.5rem 1rem", borderRadius: "6px", border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontWeight: "500" }}>
            Auto-Generate
          </button>
          <button 
            className="ui-btn-primary" 
            onClick={handlePublish}
            disabled={publishing || published}
            style={{ padding: "0.5rem 1rem", borderRadius: "6px", border: "none", background: published ? "#10b981" : "#2563eb", color: "#fff", cursor: published ? "default" : "pointer", fontWeight: "500", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
          >
            {publishing ? "Publishing..." : published ? "✓ Published" : "Publish Timetable"}
          </button>
        </div>
      </header>

      <section className="timetable-filters" style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", background: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "#475569", marginBottom: "0.25rem" }}>Program</label>
          <select style={{ width: "100%", padding: "0.4rem", borderRadius: "4px", border: "1px solid #cbd5e1" }}>
            <option>B.Tech Computer Science</option>
            <option>B.Tech Mechanical</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "#475569", marginBottom: "0.25rem" }}>Semester</label>
          <select style={{ width: "100%", padding: "0.4rem", borderRadius: "4px", border: "1px solid #cbd5e1" }}>
            <option>Semester 3 (Fall 2025)</option>
            <option>Semester 4 (Spring 2026)</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "#475569", marginBottom: "0.25rem" }}>Section</label>
          <select style={{ width: "100%", padding: "0.4rem", borderRadius: "4px", border: "1px solid #cbd5e1" }}>
            <option>Section A</option>
            <option>Section B</option>
          </select>
        </div>
      </section>

      <div className="timetable-container" style={{ overflowX: "auto", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
          <thead>
            <tr>
              <th style={{ padding: "1rem", background: "#f1f5f9", borderBottom: "1px solid #e2e8f0", borderRight: "1px solid #e2e8f0", width: "100px", textAlign: "center", color: "#475569", fontWeight: "600", fontSize: "0.85rem" }}>Day \ Time</th>
              {PERIODS.map((p, i) => (
                <th key={i} style={{ padding: "0.75rem", background: "#f1f5f9", borderBottom: "1px solid #e2e8f0", borderRight: i < PERIODS.length - 1 ? "1px solid #e2e8f0" : "none", textAlign: "center", color: "#475569", fontWeight: "600", fontSize: "0.85rem", width: "16%" }}>
                  {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day, dIdx) => (
              <tr key={day}>
                <td style={{ padding: "1rem", borderBottom: dIdx < DAYS.length - 1 ? "1px solid #e2e8f0" : "none", borderRight: "1px solid #e2e8f0", textAlign: "center", fontWeight: "600", color: "#334155", fontSize: "0.9rem" }}>
                  {day}
                </td>
                {PERIODS.map((_, pIdx) => {
                  const cell = MOCK_SCHEDULE[day]?.[pIdx];
                  return (
                    <td key={pIdx} style={{ padding: "0.5rem", borderBottom: dIdx < DAYS.length - 1 ? "1px solid #e2e8f0" : "none", borderRight: pIdx < PERIODS.length - 1 ? "1px solid #e2e8f0" : "none", verticalAlign: "top" }}>
                      {cell ? (
                        <div style={{ 
                          background: cell.conflict ? "#fef2f2" : "#f0fdf4", 
                          border: `1px solid ${cell.conflict ? "#f87171" : "#86efac"}`, 
                          borderRadius: "6px", 
                          padding: "0.5rem", 
                          height: "100%",
                          boxShadow: cell.conflict ? "0 1px 3px rgba(239,68,68,0.2)" : "none"
                        }}>
                          <div style={{ fontSize: "0.85rem", fontWeight: "700", color: cell.conflict ? "#991b1b" : "#166534", marginBottom: "0.25rem" }}>
                            {cell.subject}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: cell.conflict ? "#b91c1c" : "#15803d", marginBottom: "0.15rem" }}>
                            👤 {cell.faculty}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: cell.conflict ? "#b91c1c" : "#15803d" }}>
                            📍 {cell.room}
                          </div>
                          {cell.conflict && (
                            <div style={{ marginTop: "0.5rem", fontSize: "0.7rem", fontWeight: "600", color: "#dc2626", background: "#fee2e2", padding: "0.2rem 0.4rem", borderRadius: "4px", display: "inline-block" }}>
                              ⚠️ {cell.conflictReason}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={{ height: "100%", minHeight: "80px", display: "flex", alignItems: "center", justifyContent: "center", color: "#cbd5e1", fontSize: "0.85rem", fontStyle: "italic", border: "1px dashed #e2e8f0", borderRadius: "6px" }}>
                          Empty
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

export default TimetableGeneration;
