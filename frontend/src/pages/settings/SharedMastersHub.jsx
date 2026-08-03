import { useMemo } from "react";

import { MasterCardGrid } from "@/components/ui";
import ModuleShell from "@/layout/ModuleShell";

const masterCards = [
  {
    key: "academic-year",
    title: "Academic Year",
    description: "Define academic year periods, date ranges, and set the current year context.",
    to: "/settings/academic-years",
    icon: "AY",
    accentClass: "ui-master-card-accent-blue"
  },
  {
    key: "department",
    title: "Department",
    description: "Manage departments and organizational units used across admissions and academics.",
    to: "/settings/departments",
    icon: "DP",
    accentClass: "ui-master-card-accent-emerald"
  },
  {
    key: "program",
    title: "Program / Course",
    description: "Configure trade, diploma, and degree programs linked to departments.",
    to: "/settings/programs",
    icon: "PR",
    accentClass: "ui-master-card-accent-violet"
  }
];

function SharedMastersHub() {
  const items = useMemo(() => masterCards, []);

  return (
    <ModuleShell
      title="Shared Platform Masters"
      subtitle="Foundation masters consumed by Admissions, Students, Faculty, and Academics."
    >
      <MasterCardGrid items={items} />
    </ModuleShell>
  );
}

export default SharedMastersHub;
