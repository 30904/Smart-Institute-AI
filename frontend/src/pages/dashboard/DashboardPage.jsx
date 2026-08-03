import React from 'react';
import FacultyPerformanceWidget from '@/components/widgets/FacultyPerformanceWidget';

function DashboardPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FacultyPerformanceWidget />
      </div>
    </main>
  );
}

export default DashboardPage;
