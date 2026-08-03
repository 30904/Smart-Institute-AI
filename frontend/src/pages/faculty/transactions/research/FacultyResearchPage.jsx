import React, { useState, useEffect } from "react";
import {
  getPublications, addPublication, updatePublication, deletePublication,
  getTrainings, addTraining, updateTraining, deleteTraining,
  getFaculties
} from "@/api/academic";

const PUB_TYPES = ["journal", "conference", "book", "book_chapter", "patent"];
const TRAIN_TYPES = ["workshop", "certification", "fdp", "seminar", "course"];
const TYPE_LABELS = {
  journal: "Journal", conference: "Conference", book: "Book",
  book_chapter: "Book Chapter", patent: "Patent",
  workshop: "Workshop", certification: "Certification",
  fdp: "FDP", seminar: "Seminar", course: "Course"
};
const TYPE_COLORS = {
  journal: "bg-blue-100 text-blue-700", conference: "bg-purple-100 text-purple-700",
  book: "bg-green-100 text-green-700", book_chapter: "bg-teal-100 text-teal-700",
  patent: "bg-orange-100 text-orange-700", workshop: "bg-indigo-100 text-indigo-700",
  certification: "bg-yellow-100 text-yellow-700", fdp: "bg-pink-100 text-pink-700",
  seminar: "bg-rose-100 text-rose-700", course: "bg-cyan-100 text-cyan-700"
};

function initPub() {
  return { faculty_id: "", title: "", publication_type: "journal", journal_or_venue: "", year: new Date().getFullYear(), authors: "", doi_or_url: "", is_indexed: false };
}
function initTraining() {
  return { faculty_id: "", training_title: "", training_type: "workshop", organizer: "", from_date: "", to_date: "", duration_days: 1, certificate_url: "" };
}

export default function FacultyResearchPage() {
  const [activeTab, setActiveTab] = useState("publications");
  const [faculties, setFaculties] = useState([]);
  const [publications, setPublications] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [pubForm, setPubForm] = useState(initPub());
  const [trainForm, setTrainForm] = useState(initTraining());
  const [modalType, setModalType] = useState("publications");

  const loadAll = async () => {
    setLoading(true);
    try {
      const [facRes, pubRes, trainRes] = await Promise.all([
        getFaculties(), getPublications(), getTrainings()
      ]);
      setFaculties(facRes.data || []);
      setPublications(pubRes.data || []);
      setTrainings(trainRes.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadAll(); }, []);

  const openNewModal = (type) => {
    setModalType(type);
    setEditingId(null);
    type === "publications" ? setPubForm(initPub()) : setTrainForm(initTraining());
    setShowModal(true);
  };

  const openEditModal = (type, record) => {
    setModalType(type);
    setEditingId(record._id);
    if (type === "publications") {
      setPubForm({
        faculty_id: record.faculty_id?._id || record.faculty_id || "",
        title: record.title, publication_type: record.publication_type,
        journal_or_venue: record.journal_or_venue || "", year: record.year,
        authors: record.authors || "", doi_or_url: record.doi_or_url || "",
        is_indexed: record.is_indexed || false
      });
    } else {
      setTrainForm({
        faculty_id: record.faculty_id?._id || record.faculty_id || "",
        training_title: record.training_title, training_type: record.training_type,
        organizer: record.organizer || "",
        from_date: record.from_date ? record.from_date.substring(0, 10) : "",
        to_date: record.to_date ? record.to_date.substring(0, 10) : "",
        duration_days: record.duration_days || 1, certificate_url: record.certificate_url || ""
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === "publications") {
        editingId ? await updatePublication(editingId, pubForm) : await addPublication(pubForm);
      } else {
        editingId ? await updateTraining(editingId, trainForm) : await addTraining(trainForm);
      }
      setShowModal(false);
      loadAll();
    } catch (err) { alert(err?.response?.data?.message || "Operation failed"); }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm("Remove this record?")) return;
    try {
      type === "publications" ? await deletePublication(id) : await deleteTraining(id);
      loadAll();
    } catch { alert("Delete failed"); }
  };

  const inputCls = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition";
  const labelCls = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Research & Training</h1>
          <p className="text-slate-500 mt-1">Manage faculty publications and professional development records</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Publications", value: publications.length, icon: "menu_book", color: "from-blue-500 to-indigo-600" },
            { label: "Indexed Papers", value: publications.filter(p => p.is_indexed).length, icon: "verified", color: "from-emerald-500 to-teal-600" },
            { label: "Training Records", value: trainings.length, icon: "school", color: "from-purple-500 to-pink-600" },
            { label: "Certifications", value: trainings.filter(t => t.training_type === "certification").length, icon: "workspace_premium", color: "from-orange-500 to-amber-600" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
                <span className="material-symbols-outlined text-white text-[20px]">{s.icon}</span>
              </div>
              <p className="text-2xl font-black text-slate-800">{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex border-b border-slate-100">
            {["publications", "trainings"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 px-6 text-sm font-semibold transition-all ${
                  activeTab === tab
                    ? "bg-primary-50 text-primary-700 border-b-2 border-primary-500"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="material-symbols-outlined text-[18px] mr-2 align-middle">
                  {tab === "publications" ? "menu_book" : "school"}
                </span>
                {tab === "publications" ? "Publications" : "Training Log"}
              </button>
            ))}
          </div>

          <div className="p-6">
            <div className="flex justify-between items-center mb-5">
              <p className="text-sm text-slate-500">
                {activeTab === "publications" ? publications.length : trainings.length} records
              </p>
              <button
                onClick={() => openNewModal(activeTab)}
                className="btn-primary flex items-center gap-2 text-sm py-2 px-4"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                {activeTab === "publications" ? "Add Publication" : "Add Training"}
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <span className="material-symbols-outlined animate-spin text-4xl text-primary-400">progress_activity</span>
              </div>
            ) : activeTab === "publications" ? (
              <PublicationsList
                data={publications} onEdit={r => openEditModal("publications", r)}
                onDelete={id => handleDelete("publications", id)}
              />
            ) : (
              <TrainingList
                data={trainings} onEdit={r => openEditModal("trainings", r)}
                onDelete={id => handleDelete("trainings", id)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">
                {editingId ? "Edit" : "Add"} {modalType === "publications" ? "Publication" : "Training Record"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700 transition">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Faculty Selector (shared) */}
              <div>
                <label className={labelCls}>Faculty Member *</label>
                <select
                  required
                  value={modalType === "publications" ? pubForm.faculty_id : trainForm.faculty_id}
                  onChange={e => modalType === "publications"
                    ? setPubForm({ ...pubForm, faculty_id: e.target.value })
                    : setTrainForm({ ...trainForm, faculty_id: e.target.value })}
                  className={inputCls}
                >
                  <option value="">Select Faculty</option>
                  {faculties.map(f => (
                    <option key={f._id} value={f._id}>{f.first_name} {f.last_name} ({f.employee_id})</option>
                  ))}
                </select>
              </div>

              {modalType === "publications" ? (
                <PubFields form={pubForm} setForm={setPubForm} inputCls={inputCls} labelCls={labelCls} />
              ) : (
                <TrainFields form={trainForm} setForm={setTrainForm} inputCls={inputCls} labelCls={labelCls} />
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">
                  {editingId ? "Update" : "Save"} Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function PubFields({ form, setForm, inputCls, labelCls }) {
  return (
    <>
      <div>
        <label className={labelCls}>Title *</label>
        <input required type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inputCls} placeholder="Full publication title" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Type *</label>
          <select required value={form.publication_type} onChange={e => setForm({ ...form, publication_type: e.target.value })} className={inputCls}>
            {PUB_TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Year *</label>
          <input required type="number" min="1900" max="2100" value={form.year} onChange={e => setForm({ ...form, year: +e.target.value })} className={inputCls} />
        </div>
      </div>
      <div>
        <label className={labelCls}>Journal / Venue</label>
        <input type="text" value={form.journal_or_venue} onChange={e => setForm({ ...form, journal_or_venue: e.target.value })} className={inputCls} placeholder="Journal name or conference name" />
      </div>
      <div>
        <label className={labelCls}>Authors</label>
        <input type="text" value={form.authors} onChange={e => setForm({ ...form, authors: e.target.value })} className={inputCls} placeholder="Comma-separated co-authors" />
      </div>
      <div>
        <label className={labelCls}>DOI / URL</label>
        <input type="text" value={form.doi_or_url} onChange={e => setForm({ ...form, doi_or_url: e.target.value })} className={inputCls} placeholder="https://doi.org/..." />
      </div>
      <label className="flex items-center gap-3 cursor-pointer group">
        <input type="checkbox" checked={form.is_indexed} onChange={e => setForm({ ...form, is_indexed: e.target.checked })} className="w-4 h-4 accent-primary-600" />
        <span className="text-sm font-medium text-slate-700">Indexed (Scopus / SCI / Web of Science)</span>
      </label>
    </>
  );
}

function TrainFields({ form, setForm, inputCls, labelCls }) {
  return (
    <>
      <div>
        <label className={labelCls}>Training Title *</label>
        <input required type="text" value={form.training_title} onChange={e => setForm({ ...form, training_title: e.target.value })} className={inputCls} placeholder="Full name of training / program" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Type *</label>
          <select required value={form.training_type} onChange={e => setForm({ ...form, training_type: e.target.value })} className={inputCls}>
            {TRAIN_TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Duration (Days)</label>
          <input type="number" min="1" value={form.duration_days} onChange={e => setForm({ ...form, duration_days: +e.target.value })} className={inputCls} />
        </div>
      </div>
      <div>
        <label className={labelCls}>Organizer</label>
        <input type="text" value={form.organizer} onChange={e => setForm({ ...form, organizer: e.target.value })} className={inputCls} placeholder="Institution / body" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>From Date *</label>
          <input required type="date" value={form.from_date} onChange={e => setForm({ ...form, from_date: e.target.value })} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>To Date *</label>
          <input required type="date" value={form.to_date} onChange={e => setForm({ ...form, to_date: e.target.value })} className={inputCls} />
        </div>
      </div>
      <div>
        <label className={labelCls}>Certificate URL</label>
        <input type="url" value={form.certificate_url} onChange={e => setForm({ ...form, certificate_url: e.target.value })} className={inputCls} placeholder="https://..." />
      </div>
    </>
  );
}

function PublicationsList({ data, onEdit, onDelete }) {
  if (!data.length) return <EmptyState icon="menu_book" text="No publications found. Add your first record!" />;
  return (
    <div className="space-y-3">
      {data.map(p => (
        <div key={p._id} className="border border-slate-100 rounded-xl p-5 hover:border-primary-200 hover:shadow-sm transition-all group">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLORS[p.publication_type]}`}>
                  {TYPE_LABELS[p.publication_type]}
                </span>
                {p.is_indexed && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">verified</span> Indexed
                  </span>
                )}
                <span className="text-[11px] text-slate-400">{p.year}</span>
              </div>
              <h3 className="font-semibold text-slate-800 leading-snug mb-1">{p.title}</h3>
              {p.journal_or_venue && <p className="text-sm text-primary-600 italic mb-1">{p.journal_or_venue}</p>}
              {p.authors && <p className="text-xs text-slate-500">Authors: {p.authors}</p>}
              {p.faculty_id && (
                <p className="text-xs text-slate-400 mt-1">
                  Faculty: {p.faculty_id.first_name} {p.faculty_id.last_name}
                </p>
              )}
              {p.doi_or_url && (
                <a href={p.doi_or_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline mt-1">
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span> View
                </a>
              )}
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onEdit(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                <span className="material-symbols-outlined text-[18px]">edit</span>
              </button>
              <button onClick={() => onDelete(p._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TrainingList({ data, onEdit, onDelete }) {
  if (!data.length) return <EmptyState icon="school" text="No training records yet. Add the first one!" />;
  return (
    <div className="space-y-3">
      {data.map(t => (
        <div key={t._id} className="border border-slate-100 rounded-xl p-5 hover:border-primary-200 hover:shadow-sm transition-all group">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLORS[t.training_type]}`}>
                  {TYPE_LABELS[t.training_type]}
                </span>
                <span className="text-[11px] text-slate-400">{t.duration_days} day{t.duration_days !== 1 ? "s" : ""}</span>
              </div>
              <h3 className="font-semibold text-slate-800 leading-snug mb-1">{t.training_title}</h3>
              {t.organizer && <p className="text-sm text-slate-600 mb-1">{t.organizer}</p>}
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">calendar_today</span>
                  {t.from_date ? new Date(t.from_date).toLocaleDateString() : ""} – {t.to_date ? new Date(t.to_date).toLocaleDateString() : ""}
                </span>
              </div>
              {t.faculty_id && (
                <p className="text-xs text-slate-400 mt-1">
                  Faculty: {t.faculty_id.first_name} {t.faculty_id.last_name}
                </p>
              )}
              {t.certificate_url && (
                <a href={t.certificate_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline mt-1">
                  <span className="material-symbols-outlined text-[14px]">workspace_premium</span> Certificate
                </a>
              )}
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onEdit(t)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                <span className="material-symbols-outlined text-[18px]">edit</span>
              </button>
              <button onClick={() => onDelete(t._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ icon, text }) {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="material-symbols-outlined text-3xl text-slate-400">{icon}</span>
      </div>
      <p className="text-slate-500 text-sm">{text}</p>
    </div>
  );
}
