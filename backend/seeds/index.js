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
  }
];

const DEPARTMENT_SEEDS = [
  { code: "CS", name: "Computer Science", is_active: true },
  { code: "ME", name: "Mechanical Engineering", is_active: true },
  { code: "EE", name: "Electrical Engineering", is_active: true },
  { code: "CE", name: "Civil Engineering", is_active: true }
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
  }
];

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
  await seedInstitution();
  await seedAdminUser();
  await seedUserMenuOverrides();

  console.log("Seeding completed: admin, roles, permissions, institution, academic years, departments, programs.");
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
