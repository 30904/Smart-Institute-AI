import React, { useState, useEffect } from "react";
import { addPerformanceRecord } from "@/api/academic";
import { fetchUsers } from "@/api/core"; // Fetch faculty list

function AddPerformanceForm({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    faculty_id: "",
    period: "",
    teaching_rating: "",
    research_rating: "",
    service_rating: "",
    comments: ""
  });
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchFaculties() {
      try {
        const res = await fetchUsers({ role: "Faculty" });
        setFaculties(res.data || []);
      } catch (err) {
        console.error(err);
      }
    }
    fetchFaculties();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      
      const payload = {
        faculty_id: formData.faculty_id,
        period: formData.period,
        teaching_rating: Number(formData.teaching_rating),
        research_rating: Number(formData.research_rating),
        service_rating: Number(formData.service_rating),
        comments: formData.comments
      };

      await addPerformanceRecord(payload);
      onSuccess();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to submit evaluation");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none bg-slate-50/50 focus:bg-white";
  const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2";

  return (
    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 p-8 max-w-4xl mx-auto relative overflow-hidden">
      {/* Decorative top gradient */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600"></div>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center">
          <span className="material-symbols-outlined text-2xl">rate_review</span>
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">New Evaluation</h2>
          <p className="text-slate-500 text-sm mt-1">Log performance ratings for a faculty member</p>
        </div>
      </div>
      
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-2xl mb-6 text-sm font-medium border border-red-100 flex items-start gap-3">
          <span className="material-symbols-outlined text-[20px]">error</span>
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="md:col-span-2">
            <label className={labelClass}>Faculty Member</label>
            <select
              name="faculty_id"
              value={formData.faculty_id}
              onChange={handleChange}
              className={inputClass}
              required
            >
              <option value="">Select Faculty...</option>
              {faculties.map(f => (
                <option key={f._id} value={f._id}>{f.name} ({f.email})</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Evaluation Period</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">calendar_month</span>
              <input
                type="text"
                name="period"
                value={formData.period}
                onChange={handleChange}
                className={`${inputClass} pl-10`}
                placeholder="e.g. 2026-Q1, 2026-Semester1"
                required
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Teaching Rating</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">school</span>
              <input
                type="number"
                name="teaching_rating"
                min="1" max="5" step="0.1"
                value={formData.teaching_rating}
                onChange={handleChange}
                className={`${inputClass} pl-10`}
                placeholder="1.0 - 5.0"
                required
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Research Rating</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">science</span>
              <input
                type="number"
                name="research_rating"
                min="1" max="5" step="0.1"
                value={formData.research_rating}
                onChange={handleChange}
                className={`${inputClass} pl-10`}
                placeholder="1.0 - 5.0"
                required
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Service Rating</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">volunteer_activism</span>
              <input
                type="number"
                name="service_rating"
                min="1" max="5" step="0.1"
                value={formData.service_rating}
                onChange={handleChange}
                className={`${inputClass} pl-10`}
                placeholder="1.0 - 5.0"
                required
              />
            </div>
          </div>
        </div>

        <div className="pt-2">
          <label className={labelClass}>Qualitative Feedback</label>
          <textarea
            name="comments"
            value={formData.comments}
            onChange={handleChange}
            className={`${inputClass} h-32 resize-none`}
            placeholder="Provide constructive feedback, achievements, and areas for improvement..."
          ></textarea>
        </div>

        <div className="flex gap-4 pt-6 border-t border-slate-100 mt-8">
          <button 
            type="submit" 
            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl shadow-sm shadow-primary-600/20 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
            )}
            {loading ? "Saving..." : "Submit Evaluation"}
          </button>
          
          <button 
            type="button" 
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-all"
            onClick={onCancel} 
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddPerformanceForm;
