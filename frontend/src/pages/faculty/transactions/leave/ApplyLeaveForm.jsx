import React, { useState, useEffect } from "react";
import { applyLeave, checkLeaveConflicts } from "@/api/academic";

const leaveTypes = ["Casual Leave", "Sick Leave", "Earned Leave", "Duty Leave", "Maternity Leave", "Other"];

function ApplyLeaveForm({ onSuccess, onCancel }) {
  const [form, setForm] = useState({
    leave_type: "Casual Leave",
    start_date: "",
    end_date: "",
    reason: ""
  });
  const [conflicts, setConflicts] = useState([]);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (form.start_date && form.end_date) {
      const start = new Date(form.start_date);
      const end = new Date(form.end_date);
      if (start <= end) {
        setChecking(true);
        checkLeaveConflicts(form.start_date, form.end_date)
          .then((res) => {
            setConflicts(res.data || []);
          })
          .catch((err) => {
            console.error("Failed to check conflicts:", err);
          })
          .finally(() => setChecking(false));
      } else {
        setConflicts([]);
      }
    } else {
      setConflicts([]);
    }
  }, [form.start_date, form.end_date]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (new Date(form.start_date) > new Date(form.end_date)) {
      setError("Start date cannot be after end date.");
      return;
    }
    try {
      setSubmitting(true);
      setError("");
      await applyLeave(form);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to apply leave.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ui-card p-6">
      <h3 className="text-lg font-semibold mb-4">Apply for Leave</h3>
      {error && <p className="ui-error-text mb-4">{error}</p>}
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label>
          Leave Type
          <select required name="leave_type" value={form.leave_type} onChange={handleChange}>
            {leaveTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </label>
        
        <div className="grid grid-cols-2 gap-4">
          <label>
            Start Date
            <input type="date" required name="start_date" value={form.start_date} onChange={handleChange} />
          </label>
          <label>
            End Date
            <input type="date" required name="end_date" value={form.end_date} onChange={handleChange} />
          </label>
        </div>

        <label>
          Reason
          <textarea required name="reason" value={form.reason} onChange={handleChange} rows="3" placeholder="Explain your reason..."></textarea>
        </label>

        {checking && <p className="text-sm text-gray-500">Checking timetable conflicts...</p>}
        
        {!checking && conflicts.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-md">
            <h4 className="font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-600">warning</span>
              Timetable Conflict Detected
            </h4>
            <p className="text-sm mt-1 mb-2">You have {conflicts.length} class(es) scheduled during this leave period:</p>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {conflicts.map((slot) => (
                <li key={slot._id}>
                  {slot.day} - Period {slot.period} ({slot.subject}, {slot.program} {slot.section})
                </li>
              ))}
            </ul>
            <p className="text-xs text-orange-600 mt-2 font-medium">Please ensure classes are covered before proceeding.</p>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-4">
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Applying..." : "Submit Application"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ApplyLeaveForm;
