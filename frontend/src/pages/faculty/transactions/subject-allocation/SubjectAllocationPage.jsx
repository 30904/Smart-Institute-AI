import React, { useState, useEffect } from "react";
import { getSubjectAllocations, assignSubject, removeAllocation, getFaculties } from "@/api/academic";
import { fetchAcademicYears, fetchPrograms } from "@/api/core";
import { fetchSubjects } from "@/api/academic/mastersApi";
import DataTable from "@/components/ui/DataTable";

function SubjectAllocationPage() {
  const [allocations, setAllocations] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    academic_year_id: "",
    program_id: "",
    semester: 1,
    subject_id: "",
    faculty_id: "",
    specialization_override: false
  });
  const [overrideWarning, setOverrideWarning] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [allocRes, facRes, subRes, ayRes, progRes] = await Promise.all([
        getSubjectAllocations(),
        getFaculties(),
        fetchSubjects(),
        fetchAcademicYears(),
        fetchPrograms()
      ]);
      setAllocations(allocRes.data || []);
      setFaculties(facRes.data || []);
      setSubjects(subRes.data || []);
      setAcademicYears(ayRes.data || []);
      setPrograms(progRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this subject allocation?")) return;
    try {
      await removeAllocation(id);
      loadData();
    } catch (error) {
      alert("Failed to remove allocation");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setOverrideWarning("");
      await assignSubject(formData);
      setShowModal(false);
      loadData();
    } catch (error) {
      if (error?.response?.data?.requiresOverride) {
        setOverrideWarning(error.response.data.message);
      } else {
        alert(error?.response?.data?.message || "Failed to assign subject");
      }
    }
  };

  const confirmOverride = async () => {
    try {
      await assignSubject({ ...formData, specialization_override: true });
      setShowModal(false);
      setOverrideWarning("");
      loadData();
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to assign subject even with override.");
    }
  };

  const columns = [
    { key: "academic_info", label: "Term & Program" },
    { key: "subject", label: "Subject" },
    { key: "faculty", label: "Assigned Faculty" },
    { key: "credits", label: "Credits" },
    { key: "actions", label: "Actions", align: "right" }
  ];

  const rows = allocations.map(a => ({
    id: a._id,
    academic_info: (
      <div>
        <p className="font-semibold text-slate-800">{a.program_id?.code} - Sem {a.semester}</p>
        <p className="text-xs text-slate-500">{a.academic_year_id?.name}</p>
      </div>
    ),
    subject: (
      <div>
        <p className="font-semibold text-primary-700">{a.subject_id?.name}</p>
        <p className="text-xs text-slate-500">{a.subject_id?.code}</p>
      </div>
    ),
    faculty: (
      <div>
        <p className="font-medium text-slate-700">
          {a.faculty_id?.first_name} {a.faculty_id?.last_name}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
            {a.faculty_id?.faculty_type_id?.name || "Faculty"}
          </span>
          {a.specialization_override && (
            <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded flex items-center gap-1" title="Specialization Override">
              <span className="material-symbols-outlined text-[12px]">warning</span> Override
            </span>
          )}
        </div>
      </div>
    ),
    credits: <span className="font-mono text-sm">{a.assigned_credits}</span>,
    actions: (
      <button onClick={() => handleDelete(a._id)} className="text-red-600 hover:text-red-800 p-2">
        <span className="material-symbols-outlined text-[20px]">delete</span>
      </button>
    )
  }));

  const inputClass = "w-full border border-slate-200 rounded px-3 py-2 text-sm focus:border-primary-500 outline-none";
  const labelClass = "block text-xs font-bold text-slate-500 uppercase mb-1";

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Subject Allocation</h1>
          <p className="text-sm text-slate-500">Assign subjects to faculty members</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ academic_year_id: "", program_id: "", semester: 1, subject_id: "", faculty_id: "", specialization_override: false });
            setOverrideWarning("");
            setShowModal(true);
          }}
          className="btn-primary"
        >
          Assign Subject
        </button>
      </header>

      <section className="ui-card p-4">
        {loading ? <p className="text-center py-4 text-slate-500">Loading...</p> : (
          <DataTable columns={columns} rows={rows} emptyMessage="No subjects allocated yet." />
        )}
      </section>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold">Assign Subject to Faculty</h2>
              <button onClick={() => setShowModal(false)}><span className="material-symbols-outlined">close</span></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Academic Year</label>
                  <select required value={formData.academic_year_id} onChange={e => setFormData({...formData, academic_year_id: e.target.value})} className={inputClass}>
                    <option value="">Select Year</option>
                    {academicYears.map(ay => <option key={ay._id} value={ay._id}>{ay.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Program</label>
                  <select required value={formData.program_id} onChange={e => setFormData({...formData, program_id: e.target.value})} className={inputClass}>
                    <option value="">Select Program</option>
                    {programs.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Semester</label>
                  <input required type="number" min="1" max="10" value={formData.semester} onChange={e => setFormData({...formData, semester: parseInt(e.target.value)})} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Subject</label>
                  <select required value={formData.subject_id} onChange={e => setFormData({...formData, subject_id: e.target.value})} className={inputClass}>
                    <option value="">Select Subject</option>
                    {subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.code}) - {s.credits} Credits</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Faculty</label>
                <select required value={formData.faculty_id} onChange={e => setFormData({...formData, faculty_id: e.target.value})} className={inputClass}>
                  <option value="">Select Faculty</option>
                  {faculties.map(f => (
                    <option key={f._id} value={f._id}>{f.first_name} {f.last_name} ({f.employee_id}) - {f.department_id?.name}</option>
                  ))}
                </select>
              </div>

              {overrideWarning && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-sm text-yellow-800">
                  <div className="flex gap-2 font-bold mb-1">
                    <span className="material-symbols-outlined text-[20px]">warning</span>
                    Specialization Warning
                  </div>
                  <p className="mb-3">{overrideWarning}</p>
                  <div className="flex gap-3">
                    <button type="button" onClick={confirmOverride} className="btn-primary bg-yellow-600 hover:bg-yellow-700 text-xs py-1.5 px-3">
                      Override & Assign
                    </button>
                    <button type="button" onClick={() => setOverrideWarning("")} className="btn-secondary text-xs py-1.5 px-3">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button type="submit" className="btn-primary" disabled={!!overrideWarning}>Validate & Assign</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubjectAllocationPage;
