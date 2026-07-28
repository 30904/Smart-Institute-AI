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
const NAV_MODULES = ["admissions", "students", "faculty", "academics", "lms", "exams", "fees", "dashboard"];
const ALL_ACTIONS = ["view", "create", "edit", "delete", "approve"];

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
  await Institution.updateOne(
    { isActive: true },
    {
      $set: {
        name: "Smart Institute AI",
        workspaceLabel: "Celeris Technologies Pvt Ltd",
        financialYear: "FY 2025-26",
        location: "Head Office",
        isActive: true
      }
    },
    { upsert: true }
  );
}

async function seedAcademicYear() {
  await AcademicYear.updateOne(
    { code: "AY-2025-26" },
    {
      $set: {
        name: "Academic Year 2025-26",
        code: "AY-2025-26",
        startDate: new Date("2025-04-01T00:00:00.000Z"),
        endDate: new Date("2026-03-31T00:00:00.000Z"),
        isCurrent: true,
        isActive: true
      }
    },
    { upsert: true }
  );
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
  await seedRolePermissions();
  await seedInstitution();
  await seedAcademicYear();
  await seedAdminUser();
  await seedUserMenuOverrides();

  console.log("Seeding completed: admin, roles, permissions, institution, academic year.");
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
