import React, { useState, useEffect } from "react";
import { getWorkloadRules, createWorkloadRule, updateWorkloadRule, deleteWorkloadRule } from "@/api/academic";
import { fetchFacultyTypes } from "@/api/academic/mastersApi";
import DataTable from "@/components/ui/DataTable";

function WorkloadRulesPage() {
  const [rules, setRules] = useState([]);
  const [facultyTypes, setFacultyTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    faculty_type_id: "",
    max_weekly_hours: 40,
    max_subjects_per_semester: 5
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [rulesRes, typesRes] = await Promise.all([
        getWorkloadRules(),
        fetchFacultyTypes()
      ]);
      setRules(rulesRes.data || []);
      setFacultyTypes(typesRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEdit = (rule) => {
    setEditingId(rule._id);
    setFormData({
      faculty_type_id: rule.faculty_type_id?._id || "",
      max_weekly_hours: rule.max_weekly_hours,
      max_subjects_per_semester: rule.max_subjects_per_semester
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this rule?")) return;
    try {
      await deleteWorkloadRule(id);
      loadData();
    } catch (error) {
      alert("Delete failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateWorkloadRule(editingId, formData);
      } else {
        await createWorkloadRule(formData);
      }
      setShowModal(false);
      setEditingId(null);
      loadData();
    } catch (error) {
      alert(error?.response?.data?.message || "Operation failed");
    }
  };

  const columns = [
    { key: "faculty_type", label: "Faculty Type" },
    { key: "max_hours", label: "Max Weekly Hours / Credits" },
    { key: "max_subjects", label: "Max Subjects per Sem" },
    { key: "actions", label: "Actions", align: "right" }
  ];

  const rows = rules.map(r => ({
    id: r._id,
    faculty_type: <span className="font-semibold text-slate-800">{r.faculty_type_id?.name || "-"}</span>,
    max_hours: r.max_weekly_hours,
    max_subjects: r.max_subjects_per_semester,
    actions: (
      <div className="flex justify-end gap-2">
        <button onClick={() => handleEdit(r)} className="text-blue-600 hover:text-blue-800">
          <span className="material-symbols-outlined text-[20px]">edit</span>
        </button>
        <button onClick={() => handleDelete(r._id)} className="text-red-600 hover:text-red-800">
          <span className="material-symbols-outlined text-[20px]">delete</span>
        </button>
      </div>
    )
  }));

  const inputClass = "w-full border border-slate-200 rounded px-3 py-2 text-sm focus:border-primary-500 outline-none";

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Workload Rules</h1>
          <p className="text-sm text-slate-500">Define maximum teaching hours by Faculty Type</p>
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData({ faculty_type_id: "", max_weekly_hours: 40, max_subjects_per_semester: 5 });
            setShowModal(true);
          }}
          className="btn-primary"
        >
          Add Rule
        </button>
      </header>

      <section className="ui-card p-4">
        {loading ? <p className="text-center text-slate-500 py-4">Loading...</p> : (
          <DataTable columns={columns} rows={rows} emptyMessage="No rules found." />
        )}
      </section>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold">{editingId ? "Edit Rule" : "Add Rule"}</h2>
              <button onClick={() => setShowModal(false)}><span className="material-symbols-outlined">close</span></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Faculty Type</label>
                <select 
                  required 
                  value={formData.faculty_type_id} 
                  onChange={e => setFormData({...formData, faculty_type_id: e.target.value})} 
                  className={inputClass}
                  disabled={editingId !== null} // Usually don't want to change the type once created
                >
                  <option value="">Select Faculty Type</option>
                  {facultyTypes.map(ft => (
                    <option key={ft._id} value={ft._id}>{ft.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Max Weekly Hours (Credits)</label>
                <input 
                  required type="number" min="1"
                  value={formData.max_weekly_hours} 
                  onChange={e => setFormData({...formData, max_weekly_hours: parseInt(e.target.value)})} 
                  className={inputClass} 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Max Subjects per Semester</label>
                <input 
                  required type="number" min="1"
                  value={formData.max_subjects_per_semester} 
                  onChange={e => setFormData({...formData, max_subjects_per_semester: parseInt(e.target.value)})} 
                  className={inputClass} 
                />
              </div>

              <div className="flex justify-end pt-2">
                <button type="submit" className="btn-primary w-full">Save Rule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkloadRulesPage;
