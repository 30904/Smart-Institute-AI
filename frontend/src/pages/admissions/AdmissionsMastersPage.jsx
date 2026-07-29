import { MasterCardGrid } from "@/components/ui";
import ModuleShell from "@/layout/ModuleShell";

const admissionMasterCards = [
  {
    key: "academic-year",
    title: "Academic Year",
    description: "Manage academic periods and the current admission year.",
    to: "/settings/academic-years",
    icon: "AY",
    accentClass: "ui-master-card-accent-blue"
  },
  {
    key: "admission-cycle",
    title: "Admission Cycle",
    description: "Configure application windows and their draft, open, or closed status.",
    icon: "AC",
    accentClass: "ui-master-card-accent-emerald"
  },
  {
    key: "programs",
    title: "Programs / Courses",
    description: "Manage programs offered for admission and their default intake.",
    to: "/settings/programs",
    icon: "PR",
    accentClass: "ui-master-card-accent-violet"
  },
  {
    key: "departments",
    title: "Departments",
    description: "Manage departments that own programs and admission offerings.",
    to: "/settings/departments",
    icon: "DP",
    accentClass: "ui-master-card-accent-blue"
  },
  {
    key: "intake-capacity",
    title: "Intake Capacity",
    description: "Define available seats by admission cycle, program, and category.",
    icon: "IN",
    accentClass: "ui-master-card-accent-emerald"
  },
  {
    key: "categories",
    title: "Admission Categories",
    description: "Configure admission categories, codes, and quota percentages.",
    icon: "CT",
    accentClass: "ui-master-card-accent-violet"
  },
  {
    key: "eligibility",
    title: "Eligibility Criteria",
    description: "Set program qualifications, minimum marks, and validation rules.",
    icon: "EL",
    accentClass: "ui-master-card-accent-blue"
  },
  {
    key: "document-checklist",
    title: "Document Checklist",
    description: "Define mandatory documents and program-specific requirements.",
    icon: "DC",
    accentClass: "ui-master-card-accent-emerald"
  },
  {
    key: "fee-mapping",
    title: "Fee Mapping",
    description: "Map programs and admission cycles to the applicable fee structure.",
    icon: "FM",
    accentClass: "ui-master-card-accent-violet"
  },
  {
    key: "scholarship-rules",
    title: "Scholarship Rules",
    description: "Configure admission-facing eligibility and benefit rules.",
    icon: "SR",
    accentClass: "ui-master-card-accent-blue"
  },
  {
    key: "statuses",
    title: "Admission Statuses",
    description: "Review the controlled statuses used throughout the admission workflow.",
    icon: "ST",
    accentClass: "ui-master-card-accent-emerald"
  }
];

function AdmissionsMastersPage() {
  return (
    <ModuleShell
      title="Admissions"
      subtitle="Manage applications, enrollment, and admission workflows."
      activeTab="Masters"
      basePath="/admissions"
    >
      <MasterCardGrid items={admissionMasterCards} />
    </ModuleShell>
  );
}

export default AdmissionsMastersPage;
