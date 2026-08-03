import React, { useState, useEffect } from "react";
import { getFaculties, registerFaculty, updateFaculty, deleteFaculty } from "@/api/academic";
import { fetchDepartments, fetchUsers } from "@/api/core";
import { fetchDesignations, fetchFacultyTypes, fetchQualificationMasters } from "@/api/academic/mastersApi";
import DataTable from "@/components/ui/DataTable";

function FacultyRegistrationPage() {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Dropdown data
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [facultyTypes, setFacultyTypes] = useState([]);
  const [qualifications, setQualifications] = useState([]);
  const [users, setUsers] = useState([]);

  const [formData, setFormData] = useState(initialFormState());

  function initialFormState() {
    return {
      employee_id: "",
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      department_id: "",
      designation_id: "",
      faculty_type_id: "",
      qualification_id: "",
      joining_date: "",
      status: "active",
      user_id: ""
    };
  }

  const loadData = async () => {
    try {
      setLoading(true);
      const [facRes, depRes, desRes, typeRes, qualRes, userRes] = await Promise.all([
        getFaculties(),
        fetchDepartments(),
        fetchDesignations(),
        fetchFacultyTypes(),
        fetchQualificationMasters(),
        fetchUsers({ role: "Faculty" }) // Get users that might be faculty
      ]);
      setFaculties(facRes.data || []);
      setDepartments(depRes.data || []);
      setDesignations(desRes.data || []);
      setFacultyTypes(typeRes.data || []);
      setQualifications(qualRes.data || []);
      setUsers(userRes.data || []);
    } catch (err) {
      console.error("Error loading data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEdit = (faculty) => {
    setEditingId(faculty._id);
    setFormData({
      employee_id: faculty.employee_id || "",
      first_name: faculty.first_name || "",
      last_name: faculty.last_name || "",
      email: faculty.email || "",
      phone: faculty.phone || "",
      department_id: faculty.department_id?._id || "",
      designation_id: faculty.designation_id?._id || "",
      faculty_type_id: faculty.faculty_type_id?._id || "",
      qualification_id: faculty.qualification_id?._id || "",
      joining_date: faculty.joining_date ? faculty.joining_date.substring(0, 10) : "",
      status: faculty.status || "active",
      user_id: faculty.user_id?._id || ""
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this faculty member?")) return;
    try {
      await deleteFaculty(id);
      loadData();
    } catch (error) {
      alert("Failed to delete");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (!payload.user_id) payload.user_id = null; // Ensure null if empty

      if (editingId) {
        await updateFaculty(editingId, payload);
      } else {
        await registerFaculty(payload);
      }
      setShowModal(false);
      setEditingId(null);
      setFormData(initialFormState());
      loadData();
    } catch (error) {
      alert(error?.response?.data?.message || "Operation failed");
    }
  };

  const columns = [
    { key: "employee_id", label: "Emp ID" },
    { key: "name", label: "Name" },
    { key: "department", label: "Department" },
    { key: "designation", label: "Designation" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions", align: "right" }
  ];

  const rows = faculties.map(f => ({
    id: f._id,
    employee_id: <span className="font-mono text-sm">{f.employee_id}</span>,
    name: (
      <div>
        <p className="font-semibold text-slate-800">{f.first_name} {f.last_name}</p>
        <p className="text-xs text-slate-500">{f.email}</p>
      </div>
    ),
    department: f.department_id?.name || "-",
    designation: f.designation_id?.name || "-",
    status: (
      <span className={`px-2 py-1 text-xs font-bold rounded-full ${
        f.status === 'active' ? 'bg-green-100 text-green-700' :
        f.status === 'on_leave' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
      }`}>
        {f.status.toUpperCase()}
      </span>
    ),
    actions: (
      <div className="flex gap-2 justify-end">
        <button onClick={() => handleEdit(f)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
          <span className="material-symbols-outlined text-[20px]">edit</span>
        </button>
        <button onClick={() => handleDelete(f._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
          <span className="material-symbols-outlined text-[20px]">delete</span>
        </button>
      </div>
    )
  }));

  const labelClass = "block text-xs font-bold text-slate-500 uppercase mb-1";
  const inputClass = "w-full border border-slate-200 rounded px-3 py-2 text-sm focus:border-primary-500 outline-none";

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Faculty Registration</h1>
          <p className="text-sm text-slate-500">Onboard and manage faculty members</p>
        </div>
        <button 
          onClick={() => { setFormData(initialFormState()); setEditingId(null); setShowModal(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">person_add</span> Register Faculty
        </button>
      </header>

      <section className="ui-card p-4">
        {loading ? (
          <p className="text-center text-slate-500 py-8">Loading faculty data...</p>
        ) : (
          <DataTable columns={columns} rows={rows} emptyMessage="No faculty registered yet." />
        )}
      </section>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl my-8">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="text-lg font-bold text-slate-800">
                {editingId ? "Edit Faculty" : "Register Faculty"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Personal Info */}
              <div>
                <h3 className="text-sm font-bold text-primary-600 mb-3 border-b pb-1">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Employee ID *</label>
                    <input required type="text" value={formData.employee_id} onChange={e => setFormData({...formData, employee_id: e.target.value})} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Email *</label>
                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>First Name *</label>
                    <input required type="text" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Last Name *</label>
                    <input required type="text" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Phone *</label>
                    <input required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Joining Date *</label>
                    <input required type="date" value={formData.joining_date} onChange={e => setFormData({...formData, joining_date: e.target.value})} className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Academic Mapping */}
              <div>
                <h3 className="text-sm font-bold text-primary-600 mb-3 border-b pb-1">Academic Mapping</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Department *</label>
                    <select required value={formData.department_id} onChange={e => setFormData({...formData, department_id: e.target.value})} className={inputClass}>
                      <option value="">Select Department</option>
                      {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Designation *</label>
                    <select required value={formData.designation_id} onChange={e => setFormData({...formData, designation_id: e.target.value})} className={inputClass}>
                      <option value="">Select Designation</option>
                      {designations.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Faculty Type *</label>
                    <select required value={formData.faculty_type_id} onChange={e => setFormData({...formData, faculty_type_id: e.target.value})} className={inputClass}>
                      <option value="">Select Type</option>
                      {facultyTypes.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Highest Qualification *</label>
                    <select required value={formData.qualification_id} onChange={e => setFormData({...formData, qualification_id: e.target.value})} className={inputClass}>
                      <option value="">Select Qualification</option>
                      {qualifications.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* System Mapping */}
              <div>
                <h3 className="text-sm font-bold text-primary-600 mb-3 border-b pb-1">System Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Status</label>
                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className={inputClass}>
                      <option value="active">Active</option>
                      <option value="on_leave">On Leave</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Linked System User (Optional)</label>
                    <select value={formData.user_id} onChange={e => setFormData({...formData, user_id: e.target.value})} className={inputClass}>
                      <option value="">-- No User Link --</option>
                      {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
                    </select>
                    <p className="text-[10px] text-slate-400 mt-1">Links to a login account.</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">{editingId ? "Update Faculty" : "Register Faculty"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FacultyRegistrationPage;
