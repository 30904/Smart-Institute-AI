const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const { loadEnv } = require("../config/env");
const { connectDb } = require("../config/db");
const User = require("../models/User");
const Role = require("../models/Role");
const Permission = require("../models/Permission");
const RolePermission = require("../models/RolePermission");
const UserMenuOverride = require("../models/UserMenuOverride");
const Institution = require("../models/Institution");
const AcademicYear = require("../models/AcademicYear");
const Department = require("../models/Department");
const Program = require("../models/Program");
const AdmissionCycle = require("../models/AdmissionCycle");
const AdmissionCategory = require("../models/AdmissionCategory");
const IntakeCapacity = require("../models/IntakeCapacity");
const EligibilityCriteria = require("../models/EligibilityCriteria");
const AdmissionDocumentType = require("../models/AdmissionDocumentType");
const AdmissionFeeMapping = require("../models/AdmissionFeeMapping");
const ScholarshipRule = require("../models/ScholarshipRule");
const AdmissionStatus = require("../models/AdmissionStatus");
const { seedDemoAdmissionTransactions } = require("./demoAdmissionTransactions");

const ROLE_SEEDS = [
  { code: "super_admin", name: "Super Admin", description: "Full platform access." },
  { code: "institution_admin", name: "Institution Admin", description: "Institution-level administration." },
  { code: "admission_officer", name: "Admission Officer", description: "Admissions processing access." },
  { code: "faculty", name: "Faculty", description: "Faculty operations access." },
  { code: "exam_controller", name: "Exam Controller", description: "Exam operations access." },
  { code: "accountant", name: "Accountant", description: "Fees and finance operations access." },
  { code: "student", name: "Student", description: "Student portal access (future phase)." }
];

const MODULES = ["admissions", "students", "faculty", "academics", "lms", "exams", "fees", "dashboard", "users", "settings"];
const ACTIONS = ["view", "create", "edit", "delete", "approve"];
const LEFT_NAV_MODULES = ["admissions", "students", "faculty", "academics", "lms", "exams", "fees"];
const NAV_MODULES = ["admissions", "students", "faculty", "academics", "lms", "exams", "fees", "dashboard"];
const ALL_ACTIONS = ["view", "create", "edit", "delete", "approve"];

const ACADEMIC_YEAR_SEEDS = [
  {
    code: "AY-2024-25",
    name: "Academic Year 2024-25",
    start_date: new Date("2024-04-01T00:00:00.000Z"),
    end_date: new Date("2025-03-31T00:00:00.000Z"),
    is_current: false,
    is_active: true
  },
  {
    code: "AY-2025-26",
    name: "Academic Year 2025-26",
    start_date: new Date("2025-04-01T00:00:00.000Z"),
    end_date: new Date("2026-03-31T00:00:00.000Z"),
    is_current: true,
    is_active: true
  },
  {
    code: "AY-2026-27",
    name: "Academic Year 2026-27",
    start_date: new Date("2026-04-01T00:00:00.000Z"),
    end_date: new Date("2027-03-31T00:00:00.000Z"),
    is_current: false,
    is_active: true
  }
];

const DEPARTMENT_SEEDS = [
  { code: "CS", name: "Computer Science", is_active: true },
  { code: "ME", name: "Mechanical Engineering", is_active: true },
  { code: "EE", name: "Electrical Engineering", is_active: true },
  { code: "CE", name: "Civil Engineering", is_active: true },
  { code: "EC", name: "Electronics & Communication", is_active: true },
  { code: "MBA", name: "Management Studies", is_active: true }
];

const PROGRAM_SEEDS = [
  {
    code: "ITI-COPA",
    name: "ITI Computer Operator & Programming Assistant",
    department_code: "CS",
    duration: 2,
    program_type: "trade",
    intake_default: 40,
    description: "Trade course in computer operations and programming assistant skills."
  },
  {
    code: "DCE",
    name: "Diploma in Computer Engineering",
    department_code: "CS",
    duration: 3,
    program_type: "diploma",
    intake_default: 60,
    description: "Diploma program covering software, hardware, and networking fundamentals."
  },
  {
    code: "BCA",
    name: "Bachelor of Computer Applications",
    department_code: "CS",
    duration: 3,
    program_type: "degree",
    intake_default: 120,
    description: "Undergraduate degree in computer applications and software development."
  },
  {
    code: "DME",
    name: "Diploma in Mechanical Engineering",
    department_code: "ME",
    duration: 3,
    program_type: "diploma",
    intake_default: 60,
    description: "Diploma program in mechanical engineering and manufacturing."
  },
  {
    code: "DEE",
    name: "Diploma in Electrical Engineering",
    department_code: "EE",
    duration: 3,
    program_type: "diploma",
    intake_default: 60,
    description: "Diploma program in electrical systems and power engineering."
  },
  {
    code: "DCE-CIV",
    name: "Diploma in Civil Engineering",
    department_code: "CE",
    duration: 3,
    program_type: "diploma",
    intake_default: 60,
    description: "Diploma program in civil construction and infrastructure."
  },
  {
    code: "DEC",
    name: "Diploma in Electronics & Communication",
    department_code: "EC",
    duration: 3,
    program_type: "diploma",
    intake_default: 60,
    description: "Diploma program in electronics and communication systems."
  },
  {
    code: "MBA-GEN",
    name: "Master of Business Administration",
    department_code: "MBA",
    duration: 2,
    program_type: "degree",
    intake_default: 90,
    description: "Postgraduate management program covering strategy, finance, and operations."
  }
];

const CATEGORY_SEEDS = [
  { name: "General", code: "GEN", quota_percent: 50, is_active: true },
  { name: "OBC", code: "OBC", quota_percent: 27, is_active: true },
  { name: "SC", code: "SC", quota_percent: 15, is_active: true },
  { name: "ST", code: "ST", quota_percent: 7.5, is_active: true },
  { name: "EWS", code: "EWS", quota_percent: 10, is_active: true }
];

const STATUS_SEEDS = [
  { name: "Applied", code: "applied", sort_order: 1, is_active: true },
  { name: "Documents Pending", code: "docs_pending", sort_order: 2, is_active: true },
  { name: "Eligible", code: "eligible", sort_order: 3, is_active: true },
  { name: "Ineligible", code: "ineligible", sort_order: 4, is_active: true },
  { name: "Merit Listed", code: "merit_listed", sort_order: 5, is_active: true },
  { name: "Allotted", code: "allotted", sort_order: 6, is_active: true },
  { name: "Approved", code: "approved", sort_order: 7, is_active: true },
  { name: "Fee Pending", code: "fee_pending", sort_order: 8, is_active: true },
  { name: "Enrolled", code: "enrolled", sort_order: 9, is_active: true },
  { name: "Rejected", code: "rejected", sort_order: 10, is_active: true },
  { name: "Waitlisted", code: "waitlisted", sort_order: 11, is_active: true }
];

const DEMO_FEE_STRUCTURE_IDS = {
  "BCA|Phase 1 - Regular": new mongoose.Types.ObjectId("665f0000000000000000fee1"),
  "DCE|Phase 1 - Regular": new mongoose.Types.ObjectId("665f0000000000000000fee2"),
  "ITI-COPA|Phase 1 - Regular": new mongoose.Types.ObjectId("665f0000000000000000fee3"),
  "MBA-GEN|Phase 1 - Regular": new mongoose.Types.ObjectId("665f0000000000000000fee4"),
  "BCA|Phase 2 - Lateral": new mongoose.Types.ObjectId("665f0000000000000000fee5")
};

async function seedRoles() {
  for (const role of ROLE_SEEDS) {
    await Role.updateOne({ code: role.code }, { $set: role }, { upsert: true });
  }
}

async function seedPermissions() {
  for (const moduleName of MODULES) {
    for (const action of ACTIONS) {
      const key = `${moduleName}.${action}`;
      await Permission.updateOne({ key }, { $set: { module: moduleName, action, key } }, { upsert: true });
    }
  }
}

async function seedLeftNavPermissions() {
  for (const moduleName of LEFT_NAV_MODULES) {
    const key = `${moduleName}.view`;
    await Permission.updateOne({ key }, { $set: { module: moduleName, action: "view", key } }, { upsert: true });
  }
}

function getAllowedPermissionKeysByRole(roleCode) {
  if (roleCode === "super_admin" || roleCode === "institution_admin") {
    return MODULES.flatMap((moduleName) => ALL_ACTIONS.map((action) => `${moduleName}.${action}`));
  }

  if (roleCode === "admission_officer") {
    return [
      ...ALL_ACTIONS.map((action) => `admissions.${action}`),
      ...ALL_ACTIONS.map((action) => `students.${action}`),
      "dashboard.view"
    ];
  }

  if (roleCode === "faculty") {
    return [
      ...ALL_ACTIONS.map((action) => `faculty.${action}`),
      ...ALL_ACTIONS.map((action) => `academics.${action}`),
      ...ALL_ACTIONS.map((action) => `lms.${action}`),
      "dashboard.view"
    ];
  }

  if (roleCode === "exam_controller") {
    return [
      ...ALL_ACTIONS.map((action) => `exams.${action}`),
      ...ALL_ACTIONS.map((action) => `academics.${action}`),
      "dashboard.view"
    ];
  }

  if (roleCode === "accountant") {
    return [
      ...ALL_ACTIONS.map((action) => `fees.${action}`),
      "students.view",
      "dashboard.view"
    ];
  }

  if (roleCode === "student") {
    return [
      "students.view",
      "academics.view",
      "lms.view",
      "exams.view",
      "fees.view",
      "dashboard.view"
    ];
  }

  return NAV_MODULES.map((moduleName) => `${moduleName}.view`);
}

async function seedRolePermissions() {
  await RolePermission.deleteMany({});

  const roles = await Role.find({}).lean();
  const permissions = await Permission.find({}).lean();
  const permissionMap = new Map(permissions.map((permission) => [permission.key, permission._id]));

  const docs = [];
  for (const role of roles) {
    const keys = getAllowedPermissionKeysByRole(role.code);
    for (const key of keys) {
      const permissionId = permissionMap.get(key);
      if (!permissionId) {
        continue;
      }
      docs.push({
        role_id: role._id,
        permission_id: permissionId
      });
    }
  }

  if (docs.length) {
    await RolePermission.insertMany(docs, { ordered: false });
  }
}

async function seedInstitution() {
  const defaultAy = await AcademicYear.findOne({ code: "AY-2025-26" }).lean();
  await Institution.updateOne(
    { isActive: true },
    {
      $set: {
        name: "Smart Institute AI",
        workspaceLabel: "Celeris Technologies Pvt Ltd",
        financialYear: "FY 2025-26",
        location: "Head Office",
        address: "Head Office Address",
        logo_url: "",
        default_academic_year_id: defaultAy?._id || null,
        isActive: true
      }
    },
    { upsert: true }
  );
}

async function seedAcademicYear() {
  for (const academicYear of ACADEMIC_YEAR_SEEDS) {
    await AcademicYear.updateOne({ code: academicYear.code }, { $set: academicYear }, { upsert: true });
  }

  await AcademicYear.updateMany({ code: { $ne: "AY-2025-26" } }, { $set: { is_current: false } });
  await AcademicYear.updateOne({ code: "AY-2025-26" }, { $set: { is_current: true } });
}

async function seedDepartments() {
  for (const department of DEPARTMENT_SEEDS) {
    await Department.updateOne({ code: department.code }, { $set: department }, { upsert: true });
  }
}

async function seedPrograms() {
  for (const program of PROGRAM_SEEDS) {
    const department = await Department.findOne({ code: program.department_code }).lean();
    if (!department) {
      continue;
    }

    await Program.updateOne(
      { code: program.code },
      {
        $set: {
          name: program.name,
          code: program.code,
          department_id: department._id,
          duration: program.duration,
          program_type: program.program_type,
          intake_default: program.intake_default,
          description: program.description,
          is_active: true
        }
      },
      { upsert: true }
    );
  }
}

async function seedAdmissionCategories() {
  for (const category of CATEGORY_SEEDS) {
    await AdmissionCategory.updateOne({ code: category.code }, { $set: category }, { upsert: true });
  }
}

async function seedAdmissionStatuses() {
  for (const status of STATUS_SEEDS) {
    await AdmissionStatus.updateOne({ code: status.code }, { $set: status }, { upsert: true });
  }
}

async function seedAdmissionCycles() {
  const currentAy = await AcademicYear.findOne({ code: "AY-2025-26" }).lean();
  const previousAy = await AcademicYear.findOne({ code: "AY-2024-25" }).lean();
  if (!currentAy || !previousAy) {
    return;
  }

  const cycles = [
    {
      academic_year_id: previousAy._id,
      name: "AY 2024-25 Main",
      start_date: new Date("2024-05-01T00:00:00.000Z"),
      end_date: new Date("2024-08-31T00:00:00.000Z"),
      status: "closed"
    },
    {
      academic_year_id: currentAy._id,
      name: "Phase 1 - Regular",
      start_date: new Date("2025-05-01T00:00:00.000Z"),
      end_date: new Date("2025-07-31T00:00:00.000Z"),
      status: "open"
    },
    {
      academic_year_id: currentAy._id,
      name: "Phase 2 - Lateral",
      start_date: new Date("2025-08-01T00:00:00.000Z"),
      end_date: new Date("2025-09-15T00:00:00.000Z"),
      status: "draft"
    },
    {
      academic_year_id: currentAy._id,
      name: "Phase 3 - Spot Round",
      start_date: new Date("2025-09-20T00:00:00.000Z"),
      end_date: new Date("2025-10-10T00:00:00.000Z"),
      status: "draft"
    }
  ];

  for (const cycle of cycles) {
    await AdmissionCycle.updateOne(
      { academic_year_id: cycle.academic_year_id, name: cycle.name },
      { $set: cycle },
      { upsert: true }
    );
  }
}

async function seedIntakeCapacities() {
  const openCycle = await AdmissionCycle.findOne({ name: "Phase 1 - Regular" }).lean();
  const closedCycle = await AdmissionCycle.findOne({ name: "AY 2024-25 Main" }).lean();
  if (!openCycle) {
    return;
  }

  const programs = await Program.find({
    code: { $in: ["BCA", "DCE", "ITI-COPA", "DME", "DEE", "MBA-GEN"] }
  }).lean();
  const categories = await AdmissionCategory.find({ code: { $in: ["GEN", "OBC", "SC"] } }).lean();
  const categoryByCode = new Map(categories.map((category) => [category.code, category]));

  for (const program of programs) {
    await IntakeCapacity.updateOne(
      { cycle_id: openCycle._id, program_id: program._id, category_id: null },
      {
        $set: {
          cycle_id: openCycle._id,
          program_id: program._id,
          category_id: null,
          seats: program.intake_default || 60
        }
      },
      { upsert: true }
    );

    if (closedCycle) {
      await IntakeCapacity.updateOne(
        { cycle_id: closedCycle._id, program_id: program._id, category_id: null },
        {
          $set: {
            cycle_id: closedCycle._id,
            program_id: program._id,
            category_id: null,
            seats: program.intake_default || 60
          }
        },
        { upsert: true }
      );
    }

    if (program.code === "BCA") {
      for (const [code, seats] of [
        ["GEN", 60],
        ["OBC", 32],
        ["SC", 18]
      ]) {
        const category = categoryByCode.get(code);
        if (!category) {
          continue;
        }
        await IntakeCapacity.updateOne(
          { cycle_id: openCycle._id, program_id: program._id, category_id: category._id },
          {
            $set: {
              cycle_id: openCycle._id,
              program_id: program._id,
              category_id: category._id,
              seats
            }
          },
          { upsert: true }
        );
      }
    }
  }
}

async function seedEligibilityCriteria() {
  const criteriaByProgram = {
    BCA: {
      min_qualification: "12th / HSC passed",
      min_marks: 50,
      rules_json: { subjects_required: ["Mathematics"], age_max: 25 }
    },
    DCE: {
      min_qualification: "10th / SSC passed",
      min_marks: 40,
      rules_json: { subjects_required: ["Mathematics", "Science"] }
    },
    "ITI-COPA": {
      min_qualification: "10th / SSC passed",
      min_marks: 35,
      rules_json: { age_max: 28 }
    },
    DME: {
      min_qualification: "10th / SSC passed",
      min_marks: 40,
      rules_json: { subjects_required: ["Mathematics", "Science"] }
    },
    DEE: {
      min_qualification: "10th / SSC passed",
      min_marks: 40,
      rules_json: { subjects_required: ["Mathematics", "Science"] }
    },
    "MBA-GEN": {
      min_qualification: "Bachelor degree in any discipline",
      min_marks: 50,
      rules_json: { entrance_exam: "optional" }
    }
  };

  for (const [code, criteria] of Object.entries(criteriaByProgram)) {
    const program = await Program.findOne({ code }).lean();
    if (!program) {
      continue;
    }
    await EligibilityCriteria.updateOne(
      { program_id: program._id },
      {
        $set: {
          program_id: program._id,
          min_qualification: criteria.min_qualification,
          min_marks: criteria.min_marks,
          rules_json: criteria.rules_json
        }
      },
      { upsert: true }
    );
  }
}

async function seedDocumentTypes() {
  const bca = await Program.findOne({ code: "BCA" }).lean();
  const mba = await Program.findOne({ code: "MBA-GEN" }).lean();

  const documentTypes = [
    { name: "Passport Size Photo", mandatory: true, applies_to_program_ids: [] },
    { name: "Aadhaar Card", mandatory: true, applies_to_program_ids: [] },
    { name: "10th Marksheet", mandatory: true, applies_to_program_ids: [] },
    { name: "12th Marksheet", mandatory: true, applies_to_program_ids: bca ? [bca._id] : [] },
    { name: "Transfer Certificate", mandatory: true, applies_to_program_ids: [] },
    { name: "Caste Certificate", mandatory: false, applies_to_program_ids: [] },
    { name: "Income Certificate", mandatory: false, applies_to_program_ids: [] },
    { name: "Graduation Marksheet", mandatory: true, applies_to_program_ids: mba ? [mba._id] : [] },
    { name: "Domicile Certificate", mandatory: false, applies_to_program_ids: [] },
    { name: "Migration Certificate", mandatory: false, applies_to_program_ids: [] },
    { name: "Medical Fitness Certificate", mandatory: false, applies_to_program_ids: [] }
  ];

  for (const documentType of documentTypes) {
    await AdmissionDocumentType.updateOne(
      { name: documentType.name },
      { $set: documentType },
      { upsert: true }
    );
  }
}

async function seedFeeMappings() {
  const phase1 = await AdmissionCycle.findOne({ name: "Phase 1 - Regular" }).lean();
  const phase2 = await AdmissionCycle.findOne({ name: "Phase 2 - Lateral" }).lean();
  if (!phase1) {
    return;
  }

  const mappings = [
    { programCode: "BCA", cycle: phase1, key: "BCA|Phase 1 - Regular" },
    { programCode: "DCE", cycle: phase1, key: "DCE|Phase 1 - Regular" },
    { programCode: "ITI-COPA", cycle: phase1, key: "ITI-COPA|Phase 1 - Regular" },
    { programCode: "MBA-GEN", cycle: phase1, key: "MBA-GEN|Phase 1 - Regular" },
    { programCode: "BCA", cycle: phase2, key: "BCA|Phase 2 - Lateral" }
  ];

  for (const mapping of mappings) {
    if (!mapping.cycle) {
      continue;
    }
    const program = await Program.findOne({ code: mapping.programCode }).lean();
    const feeStructureId = DEMO_FEE_STRUCTURE_IDS[mapping.key];
    if (!program || !feeStructureId) {
      continue;
    }

    await AdmissionFeeMapping.updateOne(
      { program_id: program._id, cycle_id: mapping.cycle._id },
      {
        $set: {
          program_id: program._id,
          cycle_id: mapping.cycle._id,
          fee_structure_id: feeStructureId
        }
      },
      { upsert: true }
    );
  }
}

async function seedScholarshipRules() {
  const rules = [
    {
      name: "Merit Scholarship - 75%+",
      criteria_json: { min_marks: 75, categories: ["GEN", "OBC", "EWS"] },
      benefit_json: { tuition_waiver_percent: 25, type: "merit" }
    },
    {
      name: "SC/ST Fee Waiver",
      criteria_json: { categories: ["SC", "ST"] },
      benefit_json: { tuition_waiver_percent: 50, type: "reservation" }
    },
    {
      name: "Girl Child Incentive",
      criteria_json: { gender: "female" },
      benefit_json: { tuition_waiver_percent: 10, type: "incentive" }
    },
    {
      name: "EWS Support Grant",
      criteria_json: { categories: ["EWS"], max_family_income: 800000 },
      benefit_json: { tuition_waiver_percent: 20, type: "need_based" }
    },
    {
      name: "Sports Quota Concession",
      criteria_json: { has_sports_certificate: true },
      benefit_json: { tuition_waiver_percent: 15, type: "sports" }
    },
    {
      name: "Staff Ward Concession",
      criteria_json: { is_staff_ward: true },
      benefit_json: { tuition_waiver_percent: 40, type: "staff" }
    },
    {
      name: "Early Bird Discount",
      criteria_json: { applied_within_days: 15 },
      benefit_json: { flat_discount_inr: 2000, type: "early_bird" }
    }
  ];

  for (const rule of rules) {
    await ScholarshipRule.updateOne({ name: rule.name }, { $set: rule }, { upsert: true });
  }
}

async function seedAdminUser() {
  const email = (process.env.ADMIN_EMAIL || "admin@celeris.com").toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || "Admin@123";
  const passwordHash = await bcrypt.hash(password, 10);
  const superAdminRole = await Role.findOne({ code: "super_admin" }).lean();

  await User.updateOne(
    { email },
    {
      $set: {
        name: "System Admin",
        email,
        phone: "",
        password_hash: passwordHash,
        role_id: superAdminRole?._id || null,
        department_id: null,
        linked_faculty_id: null,
        linked_student_id: null,
        role: "super_admin",
        permissions: ["*"],
        is_active: true
      }
    },
    { upsert: true }
  );
}

async function seedUserMenuOverrides() {
  await UserMenuOverride.deleteMany({});
}

async function runSeeds() {
  loadEnv();
  await connectDb();

  await seedRoles();
  await seedPermissions();
  await seedLeftNavPermissions();
  await seedRolePermissions();
  await seedAcademicYear();
  await seedDepartments();
  await seedPrograms();
  await seedAdmissionCategories();
  await seedAdmissionStatuses();
  await seedAdmissionCycles();
  await seedIntakeCapacities();
  await seedEligibilityCriteria();
  await seedDocumentTypes();
  await seedFeeMappings();
  await seedScholarshipRules();
  await seedInstitution();
  await seedAdminUser();
  await seedUserMenuOverrides();
  await seedDemoAdmissionTransactions();

  console.log(
    "Seeding completed: admin, roles, permissions, institution, academic years, departments, programs, admission masters."
  );
}

runSeeds()
  .then(async () => {
    await mongoose.connection.close();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Seeding failed:", error.message);
    await mongoose.connection.close();
    process.exit(1);
  });
