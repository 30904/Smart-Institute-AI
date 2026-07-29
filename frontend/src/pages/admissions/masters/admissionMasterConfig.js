const statusCodeOptions = [
  ["applied", "Applied"],
  ["docs_pending", "Docs Pending"],
  ["eligible", "Eligible"],
  ["merit_listed", "Merit Listed"],
  ["allotted", "Allotted"],
  ["approved", "Approved"],
  ["fee_pending", "Fee Pending"],
  ["enrolled", "Enrolled"],
  ["rejected", "Rejected"],
  ["waitlisted", "Waitlisted"]
].map(([value, label]) => ({ value, label }));

const configs = {
  "admission-cycles": {
    title: "Admission Cycle",
    plural: "Admission Cycles",
    description: "Configure admission windows for each academic year.",
    fields: [
      { name: "academic_year_id", label: "Academic Year", type: "select", source: "academicYears", required: true },
      { name: "name", label: "Cycle Name", type: "text", required: true },
      { name: "start_date", label: "Start Date", type: "date", required: true },
      { name: "end_date", label: "End Date", type: "date", required: true },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        options: [
          { value: "draft", label: "Draft" },
          { value: "open", label: "Open" },
          { value: "closed", label: "Closed" }
        ],
        defaultValue: "draft"
      }
    ],
    columns: ["name", "academic_year_id", "start_date", "end_date", "status"]
  },
  "intake-capacities": {
    title: "Intake Capacity",
    plural: "Intake Capacities",
    description: "Allocate seats by admission cycle, program, and optional category.",
    fields: [
      { name: "cycle_id", label: "Admission Cycle", type: "select", source: "cycles", required: true },
      { name: "program_id", label: "Program", type: "select", source: "programs", required: true },
      { name: "category_id", label: "Category (optional)", type: "select", source: "categories", nullable: true },
      { name: "seats", label: "Seats", type: "number", required: true, min: 0, step: 1 }
    ],
    columns: ["cycle_id", "program_id", "category_id", "seats"]
  },
  categories: {
    title: "Admission Category",
    plural: "Admission Categories",
    description: "Manage categories and reservation quota percentages.",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "code", label: "Code", type: "text", required: true },
      { name: "quota_percent", label: "Quota Percent (optional)", type: "number", min: 0, max: 100, nullable: true },
      { name: "is_active", label: "Active", type: "checkbox", defaultValue: true }
    ],
    columns: ["name", "code", "quota_percent", "is_active"]
  },
  "eligibility-criteria": {
    title: "Eligibility Criteria",
    plural: "Eligibility Criteria",
    description: "Set qualification, minimum marks, and additional program rules.",
    fields: [
      { name: "program_id", label: "Program", type: "select", source: "programs", required: true },
      { name: "min_qualification", label: "Minimum Qualification", type: "text", required: true },
      { name: "min_marks", label: "Minimum Marks (%)", type: "number", required: true, min: 0, max: 100 },
      { name: "rules_json", label: "Additional Rules (JSON)", type: "json", defaultValue: "{}" }
    ],
    columns: ["program_id", "min_qualification", "min_marks", "rules_json"]
  },
  "document-types": {
    title: "Admission Document Type",
    plural: "Document Checklist",
    description: "Define mandatory and program-specific application documents.",
    fields: [
      { name: "name", label: "Document Name", type: "text", required: true },
      { name: "mandatory", label: "Mandatory", type: "checkbox", defaultValue: false },
      {
        name: "applies_to_program_ids",
        label: "Applicable Programs (empty means all)",
        type: "multiselect",
        source: "programs",
        defaultValue: []
      }
    ],
    columns: ["name", "mandatory", "applies_to_program_ids"]
  },
  "fee-mappings": {
    title: "Admission Fee Mapping",
    plural: "Fee Mappings",
    description: "Map a program and admission cycle to a Fees-module structure.",
    fields: [
      { name: "program_id", label: "Program", type: "select", source: "programs", required: true },
      { name: "cycle_id", label: "Admission Cycle", type: "select", source: "cycles", required: true },
      {
        name: "fee_structure_id",
        label: "Fee Structure ID",
        type: "text",
        required: true,
        placeholder: "Available after Fee Structure setup"
      }
    ],
    columns: ["program_id", "cycle_id", "fee_structure_id"]
  },
  "scholarship-rules": {
    title: "Scholarship Rule",
    plural: "Scholarship Rules",
    description: "Configure admission eligibility and Fees-module benefit adjustments.",
    fields: [
      { name: "name", label: "Rule Name", type: "text", required: true },
      { name: "criteria_json", label: "Criteria (JSON)", type: "json", required: true, defaultValue: "{}" },
      { name: "benefit_json", label: "Benefit (JSON)", type: "json", required: true, defaultValue: "{}" }
    ],
    columns: ["name", "criteria_json", "benefit_json"]
  },
  statuses: {
    title: "Admission Status",
    plural: "Admission Statuses",
    description: "Manage the controlled statuses used by the admission workflow.",
    fields: [
      { name: "name", label: "Display Name", type: "text", required: true },
      { name: "code", label: "Status Code", type: "select", options: statusCodeOptions, required: true },
      { name: "sort_order", label: "Display Order", type: "number", required: true, min: 1, step: 1 },
      { name: "is_active", label: "Active", type: "checkbox", defaultValue: true }
    ],
    columns: ["sort_order", "name", "code", "is_active"]
  }
};

export function getAdmissionMasterConfig(resource) {
  return configs[resource] || null;
}
