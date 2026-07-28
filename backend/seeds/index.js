const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const { loadEnv } = require("../config/env");
const { connectDb } = require("../config/db");
const User = require("../models/User");
const Role = require("../models/Role");
const Permission = require("../models/Permission");
const Institution = require("../models/Institution");
const AcademicYear = require("../models/AcademicYear");

const ROLE_SEEDS = [
  { code: "super_admin", name: "Super Admin", description: "Full platform access." },
  { code: "institution_admin", name: "Institution Admin", description: "Institution-level administration." },
  { code: "admission_officer", name: "Admission Officer", description: "Admissions processing access." },
  { code: "faculty", name: "Faculty", description: "Faculty operations access." },
  { code: "exam_controller", name: "Exam Controller", description: "Exam operations access." },
  { code: "accountant", name: "Accountant", description: "Fees and finance operations access." }
];

const MODULES = ["admissions", "students", "faculty", "academics", "lms", "exams", "fees", "dashboard", "users", "settings"];
const ACTIONS = ["view", "create", "edit", "delete", "approve"];

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

  await User.updateOne(
    { email },
    {
      $set: {
        name: "System Admin",
        email,
        password_hash: passwordHash,
        role: "super_admin",
        permissions: ["*"],
        is_active: true
      }
    },
    { upsert: true }
  );
}

async function runSeeds() {
  loadEnv();
  await connectDb();

  await seedRoles();
  await seedPermissions();
  await seedInstitution();
  await seedAcademicYear();
  await seedAdminUser();

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
