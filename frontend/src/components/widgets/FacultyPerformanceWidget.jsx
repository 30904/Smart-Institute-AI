import React, { useEffect, useState } from "react";
import { getPerformanceStats } from "@/api/academic";

function FacultyPerformanceWidget() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const res = await getPerformanceStats();
        setStats(res.data);
      } catch (err) {
        console.error("Error fetching performance stats", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-sm border border-slate-100 p-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          <div className="h-4 bg-slate-100 rounded"></div>
          <div className="h-4 bg-slate-100 rounded"></div>
          <div className="h-4 bg-slate-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (!stats || stats.total_evaluations === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl p-6 flex flex-col items-center justify-center min-h-[250px] shadow-sm border border-slate-200/60">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-3xl text-slate-400">monitoring</span>
        </div>
        <p className="text-slate-600 font-semibold">No Performance Data</p>
        <p className="text-sm text-slate-500 mt-1">Evaluations will appear here once logged.</p>
      </div>
    );
  }

  const ProgressBar = ({ label, value, icon, colorFrom, colorTo }) => {
    const percentage = (value / 5) * 100;

    return (
      <div className="mb-4 group">
        <div className="flex justify-between items-center text-sm mb-2">
          <span className="font-semibold text-slate-700 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-slate-600 transition-colors">{icon}</span>
            {label}
          </span>
          <span className="font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg">{value.toFixed(1)} <span className="text-slate-400 font-medium">/ 5</span></span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div 
            className={`h-full rounded-full bg-gradient-to-r ${colorFrom} ${colorTo} transition-all duration-1000 ease-out`} 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow duration-300">
      
      {/* Background decoration */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-50 rounded-full blur-3xl opacity-50 group-hover:bg-primary-100 transition-colors duration-500"></div>

      <div className="flex justify-between items-center mb-6 relative z-10">
        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
          <div className="bg-primary-50 p-1.5 rounded-lg">
            <span className="material-symbols-outlined text-primary-600 text-[20px] block">trending_up</span>
          </div>
          Performance
        </h3>
        <span className="text-xs bg-slate-50 text-slate-500 px-3 py-1 rounded-full font-semibold border border-slate-100">
          {stats.total_evaluations} Record{stats.total_evaluations !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-1 relative z-10">
        <ProgressBar label="Teaching" value={stats.average_teaching} icon="school" colorFrom="from-blue-400" colorTo="to-blue-600" />
        <ProgressBar label="Research" value={stats.average_research} icon="science" colorFrom="from-purple-400" colorTo="to-purple-600" />
        <ProgressBar label="Service" value={stats.average_service} icon="volunteer_activism" colorFrom="from-emerald-400" colorTo="to-emerald-600" />
        
        <div className="mt-6 pt-5 border-t border-slate-100/80">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Overall Average</p>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800">
                  {stats.average_overall.toFixed(1)}
                </span>
                <span className="text-sm font-bold text-slate-300">/ 5.0</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-xl">
              <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
              Excellent
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FacultyPerformanceWidget;
