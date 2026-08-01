import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getFaculties } from "@/api/academic";
import { fetchDepartments } from "@/api/core";

function FacultyDirectoryPage() {
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Filters
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [facRes, depRes] = await Promise.all([
        getFaculties({ search, department_id: departmentFilter }),
        fetchDepartments()
      ]);
      setFaculties(facRes.data || []);
      setDepartments(depRes.data || []);
    } catch (err) {
      console.error("Error loading directory data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line
  }, [departmentFilter]); // Fetch when filter changes. Search is on submit/debounce ideally, but we'll fetch on click

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  return (
    <div className="p-6 md:p-8 min-h-screen bg-slate-50/50">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Faculty Directory</h1>
          <p className="text-slate-500 mt-1">Find and connect with faculty members across departments.</p>
        </header>

        {/* Search & Filters */}
        <section className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-8">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input
                type="text"
                placeholder="Search by name, employee ID, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
              />
            </div>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
            >
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
            <button type="submit" className="btn-primary py-3 px-6 rounded-xl font-medium">Search</button>
          </form>
        </section>

        {/* Directory Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary-500">progress_activity</span>
          </div>
        ) : faculties.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center border border-slate-100 shadow-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <span className="material-symbols-outlined text-3xl">person_off</span>
            </div>
            <h3 className="text-lg font-bold text-slate-700">No Faculty Found</h3>
            <p className="text-slate-500">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {faculties.map((f) => (
              <div key={f._id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                {/* Status Indicator */}
                <div className={`absolute top-0 right-0 w-16 h-16 -mr-8 -mt-8 rounded-full ${
                  f.status === 'active' ? 'bg-green-100' : 
                  f.status === 'on_leave' ? 'bg-yellow-100' : 'bg-red-100'
                }`}></div>
                
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-2xl font-black mb-4 uppercase shadow-sm">
                    {f.first_name.charAt(0)}{f.last_name.charAt(0)}
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg">{f.first_name} {f.last_name}</h3>
                  <p className="text-primary-600 font-medium text-sm mb-1">{f.designation_id?.name || "Faculty"}</p>
                  <p className="text-slate-500 text-xs mb-4">{f.department_id?.name}</p>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100 mt-2">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <span className="material-symbols-outlined text-[18px] text-slate-400">badge</span>
                    <span className="font-mono">{f.employee_id}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <span className="material-symbols-outlined text-[18px] text-slate-400">mail</span>
                    <a href={`mailto:${f.email}`} className="hover:text-primary-600 truncate">{f.email}</a>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <span className="material-symbols-outlined text-[18px] text-slate-400">call</span>
                    <a href={`tel:${f.phone}`} className="hover:text-primary-600 truncate">{f.phone}</a>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <span className="material-symbols-outlined text-[18px] text-slate-400">school</span>
                    <span className="truncate">{f.qualification_id?.name || "N/A"}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/faculty/profile/${f._id}`)}
                  className="w-full mt-4 py-2 text-sm font-semibold text-primary-600 border border-primary-200 rounded-xl hover:bg-primary-50 transition flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                  View Profile
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FacultyDirectoryPage;
