import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFacultyById, getPublications, getTrainings, getSubjectAllocations } from "@/api/academic";

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

export default function FacultyProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [faculty, setFaculty] = useState(null);
  const [publications, setPublications] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!id) return;
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [facRes, pubRes, trainRes, allocRes] = await Promise.all([
          getFacultyById(id),
          getPublications({ faculty_id: id }),
          getTrainings({ faculty_id: id }),
          getSubjectAllocations({ faculty_id: id })
        ]);
        setFaculty(facRes.data);
        setPublications(pubRes.data || []);
        setTrainings(trainRes.data || []);
        setAllocations(allocRes.data || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <span className="material-symbols-outlined animate-spin text-5xl text-primary-400">progress_activity</span>
    </div>
  );

  if (!faculty) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <span className="material-symbols-outlined text-5xl text-slate-400">person_off</span>
      <p className="text-slate-600">Faculty not found.</p>
      <button onClick={() => navigate(-1)} className="btn-secondary">Go Back</button>
    </div>
  );

  const statusColor = faculty.status === "active" ? "bg-emerald-100 text-emerald-700" :
    faculty.status === "on_leave" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700";

  const tabs = [
    { id: "overview", label: "Overview", icon: "person" },
    { id: "subjects", label: `Subjects (${allocations.length})`, icon: "book" },
    { id: "publications", label: `Publications (${publications.length})`, icon: "menu_book" },
    { id: "training", label: `Training (${trainings.length})`, icon: "school" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/20 pb-12">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-primary-700 to-indigo-700 text-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-white/70 hover:text-white text-sm font-medium mb-6 transition"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back
          </button>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl font-black uppercase flex-shrink-0 shadow-lg">
              {faculty.first_name?.charAt(0)}{faculty.last_name?.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h1 className="text-3xl font-black">{faculty.first_name} {faculty.last_name}</h1>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColor}`}>
                  {faculty.status?.toUpperCase()}
                </span>
              </div>
              <p className="text-white/80 font-medium">{faculty.designation_id?.name}</p>
              <p className="text-white/60 text-sm">{faculty.department_id?.name}</p>
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-white/80">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">badge</span>
                  {faculty.employee_id}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">mail</span>
                  {faculty.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">call</span>
                  {faculty.phone}
                </span>
              </div>
            </div>
            {/* Quick stats */}
            <div className="flex gap-4">
              {[
                { val: publications.length, label: "Publications" },
                { val: trainings.length, label: "Trainings" },
                { val: allocations.length, label: "Subjects" },
              ].map(s => (
                <div key={s.label} className="text-center bg-white/10 backdrop-blur rounded-xl px-4 py-3">
                  <p className="text-2xl font-black">{s.val}</p>
                  <p className="text-white/70 text-xs">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-t-lg transition ${
                  activeTab === tab.id ? "bg-white text-primary-700" : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 pt-6">
        {activeTab === "overview" && <OverviewTab faculty={faculty} />}
        {activeTab === "subjects" && <SubjectsTab allocations={allocations} />}
        {activeTab === "publications" && <PublicationsTab publications={publications} />}
        {activeTab === "training" && <TrainingTab trainings={trainings} />}
      </div>
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

function OverviewTab({ faculty }) {
  const fields = [
    { label: "Full Name", value: `${faculty.first_name} ${faculty.last_name}` },
    { label: "Employee ID", value: faculty.employee_id },
    { label: "Email", value: faculty.email },
    { label: "Phone", value: faculty.phone },
    { label: "Department", value: faculty.department_id?.name },
    { label: "Designation", value: faculty.designation_id?.name },
    { label: "Faculty Type", value: faculty.faculty_type_id?.name },
    { label: "Qualification", value: faculty.qualification_id?.name },
    { label: "Joining Date", value: faculty.joining_date ? new Date(faculty.joining_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—" },
    { label: "Status", value: faculty.status },
    { label: "System User Linked", value: faculty.user_id ? "Yes" : "No" },
  ];
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <h2 className="text-lg font-bold text-slate-800 mb-5">Personal & Academic Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-10">
        {fields.map(f => (
          <div key={f.label} className="flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{f.label}</span>
            <span className="text-sm font-semibold text-slate-700 mt-0.5">{f.value || "—"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SubjectsTab({ allocations }) {
  if (!allocations.length) return <EmptyCard icon="book" text="No subjects allocated yet." />;
  return (
    <div className="space-y-3">
      {allocations.map(a => (
        <div key={a._id} className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="font-semibold text-slate-800">{a.subject_id?.name}</p>
            <p className="text-xs text-slate-500">{a.subject_id?.code} • {a.program_id?.name} — Sem {a.semester}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-black text-primary-600">{a.assigned_credits}</p>
            <p className="text-xs text-slate-400">Credits</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function PublicationsTab({ publications }) {
  if (!publications.length) return <EmptyCard icon="menu_book" text="No publications recorded yet." />;
  return (
    <div className="space-y-3">
      {publications.map(p => (
        <div key={p._id} className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <div className="flex gap-2 mb-2 flex-wrap">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLORS[p.publication_type]}`}>{TYPE_LABELS[p.publication_type]}</span>
                {p.is_indexed && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">✓ Indexed</span>}
                <span className="text-[11px] text-slate-400">{p.year}</span>
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">{p.title}</h3>
              {p.journal_or_venue && <p className="text-sm text-primary-600 italic">{p.journal_or_venue}</p>}
              {p.authors && <p className="text-xs text-slate-400 mt-1">{p.authors}</p>}
            </div>
            {p.doi_or_url && (
              <a href={p.doi_or_url} target="_blank" rel="noreferrer" className="text-primary-600 hover:text-primary-800">
                <span className="material-symbols-outlined text-[22px]">open_in_new</span>
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function TrainingTab({ trainings }) {
  if (!trainings.length) return <EmptyCard icon="school" text="No training records yet." />;
  return (
    <div className="space-y-3">
      {trainings.map(t => (
        <div key={t._id} className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex items-center justify-between">
          <div>
            <div className="flex gap-2 mb-2">
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLORS[t.training_type]}`}>{TYPE_LABELS[t.training_type]}</span>
            </div>
            <h3 className="font-semibold text-slate-800">{t.training_title}</h3>
            {t.organizer && <p className="text-sm text-slate-500 mt-0.5">{t.organizer}</p>}
            <p className="text-xs text-slate-400 mt-1">
              {t.from_date ? new Date(t.from_date).toLocaleDateString() : ""} – {t.to_date ? new Date(t.to_date).toLocaleDateString() : ""}
            </p>
          </div>
          <div className="text-right flex flex-col items-end gap-2">
            <p className="text-lg font-black text-indigo-600">{t.duration_days}d</p>
            {t.certificate_url && (
              <a href={t.certificate_url} target="_blank" rel="noreferrer" className="text-xs text-primary-600 hover:underline flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">workspace_premium</span> Certificate
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyCard({ icon, text }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
      <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <span className="material-symbols-outlined text-2xl text-slate-400">{icon}</span>
      </div>
      <p className="text-slate-500 text-sm">{text}</p>
    </div>
  );
}
