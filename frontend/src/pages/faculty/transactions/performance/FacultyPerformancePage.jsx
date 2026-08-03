import React, { useEffect, useState } from "react";
import usePermission from "@/hooks/usePermission";
import { getPerformanceRecords } from "@/api/academic";
import DataTable from "@/components/ui/DataTable";
import AddPerformanceForm from "./AddPerformanceForm";

function FacultyPerformancePage() {
  const { permissionMatrix } = usePermission();
  const canManage = permissionMatrix?.faculty?.approve; 

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await getPerformanceRecords();
      setRecords(res.data || []);
    } catch (err) {
      console.error("Error fetching performance records", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const getRatingBadge = (rating) => {
    if (rating >= 4.5) return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 shadow-sm">{rating.toFixed(1)}</span>;
    if (rating >= 3.5) return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200 shadow-sm">{rating.toFixed(1)}</span>;
    if (rating >= 2.5) return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold border border-amber-200 shadow-sm">{rating.toFixed(1)}</span>;
    return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200 shadow-sm">{rating.toFixed(1)}</span>;
  };

  const columns = [
    { key: "period", label: "Period" },
    { key: "faculty", label: "Faculty" },
    { key: "teaching", label: "Teaching", align: "center" },
    { key: "research", label: "Research", align: "center" },
    { key: "service", label: "Service", align: "center" },
    { key: "overall", label: "Overall", align: "center" },
    { key: "reviewer", label: "Reviewer" },
  ];

  const rows = records.map(r => ({
    id: r._id,
    period: <span className="font-semibold text-slate-700">{r.period}</span>,
    faculty: (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
          {r.faculty_id?.name ? r.faculty_id.name.charAt(0) : "?"}
        </div>
        <span className="font-medium text-slate-800">{r.faculty_id?.name || "Unknown"}</span>
      </div>
    ),
    teaching: getRatingBadge(r.teaching_rating),
    research: getRatingBadge(r.research_rating),
    service: getRatingBadge(r.service_rating),
    overall: getRatingBadge(r.overall_rating),
    reviewer: <span className="text-slate-500 text-sm">{r.reviewer_id?.name || "System"}</span>
  }));

  if (showForm) {
    return (
      <div className="p-4 md:p-8 min-h-screen bg-slate-50/50">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={() => setShowForm(false)}
            className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium text-sm bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 w-fit"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            Back to Dashboard
          </button>
          
          <AddPerformanceForm 
            onSuccess={() => {
              setShowForm(false);
              fetchRecords();
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 min-h-screen bg-slate-50/50">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Faculty Performance</h1>
            <p className="text-slate-500 mt-1">Comprehensive overview of periodic evaluations and ratings.</p>
          </div>
          {canManage && (
            <button 
              className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl shadow-sm shadow-primary-600/20 transition-all flex items-center gap-2" 
              onClick={() => setShowForm(true)}
            >
              <span className="material-symbols-outlined text-[20px]">add</span> 
              New Evaluation
            </button>
          )}
        </header>

        <section className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center">
              <span className="material-symbols-outlined animate-spin text-4xl text-primary-500 mb-4">progress_activity</span>
              <p className="text-slate-500 font-medium">Loading evaluation records...</p>
            </div>
          ) : (
            <div className="p-4">
              <DataTable
                columns={columns}
                rows={rows}
                emptyMessage="No performance records found."
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default FacultyPerformancePage;
