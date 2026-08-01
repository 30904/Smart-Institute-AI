import React, { useEffect, useState } from "react";
import usePermission from "@/hooks/usePermission";
import { getLeaves, updateLeaveStatus } from "@/api/academic";
import DataTable from "@/components/ui/DataTable";
import ApplyLeaveForm from "./ApplyLeaveForm";
import ActionsMenu from "@/components/ui/ActionsMenu";

function FacultyLeavePage() {
  const { permissionMatrix } = usePermission();
  const canApprove = permissionMatrix?.faculty?.approve; 

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApplyForm, setShowApplyForm] = useState(false);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await getLeaves();
      setLeaves(res.data || []);
    } catch (err) {
      console.error("Error fetching leaves", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      const comments = prompt(`Enter comments for ${status.toLowerCase()} (optional):`, "");
      if (comments === null) return;
      
      await updateLeaveStatus(id, { status, comments });
      fetchLeaves();
    } catch (err) {
      alert("Error updating status: " + (err?.response?.data?.message || err.message));
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: "text-yellow-600 bg-yellow-100",
      Approved: "text-green-600 bg-green-100",
      Rejected: "text-red-600 bg-red-100",
      Cancelled: "text-gray-600 bg-gray-100"
    };
    return colors[status] || "text-gray-600 bg-gray-100";
  };

  const columns = [
    { key: "faculty", label: "Faculty" },
    { key: "leave_type", label: "Leave Type" },
    { key: "from", label: "From" },
    { key: "to", label: "To" },
    { key: "reason", label: "Reason" },
    { key: "status", label: "Status", align: "center" },
    { key: "approved_by", label: "Approved By" },
    { key: "actions", label: "Actions", align: "center" }
  ];

  const rows = leaves.map(row => ({
    id: row._id,
    faculty: row.faculty_id?.name || "Unknown",
    leave_type: row.leave_type,
    from: new Date(row.start_date).toLocaleDateString(),
    to: new Date(row.end_date).toLocaleDateString(),
    reason: row.reason,
    status: (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(row.status)}`}>
        {row.status}
      </span>
    ),
    approved_by: row.approved_by?.name || "-",
    actions: canApprove && row.status === "Pending" ? (
      <ActionsMenu actions={[
        { label: "Approve", icon: "check_circle", onClick: () => handleStatusUpdate(row._id, "Approved") },
        { label: "Reject", icon: "cancel", onClick: () => handleStatusUpdate(row._id, "Rejected") }
      ]} />
    ) : null
  }));

  if (showApplyForm) {
    return (
      <div className="max-w-3xl mx-auto mt-8">
        <ApplyLeaveForm 
          onSuccess={() => {
            setShowApplyForm(false);
            fetchLeaves();
          }} 
          onCancel={() => setShowApplyForm(false)} 
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Leave Management</h1>
          <p className="text-sm text-slate-500">Manage and apply for faculty leaves</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowApplyForm(true)}>
          <span className="material-symbols-outlined">add</span> Apply Leave
        </button>
      </header>

      <section className="ui-card p-4">
        {loading ? (
          <p className="text-gray-500 text-center py-4">Loading leaves...</p>
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
            emptyMessage="No leaves found."
          />
        )}
      </section>
    </div>
  );
}

export default FacultyLeavePage;
