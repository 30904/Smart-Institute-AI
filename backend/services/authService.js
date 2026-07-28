const bcrypt = require("bcryptjs");

const User = require("../models/User");
const { signJwt } = require("../utils/jwt");

async function ensureDefaultAdmin() {
  const email = process.env.ADMIN_EMAIL || "admin@celeris.com";
  const password = process.env.ADMIN_PASSWORD || "Admin@123";

  const existingUser = await User.findOne({ email }).lean();
  if (existingUser) {
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({
    name: "System Admin",
    email,
    password_hash: passwordHash,
    role: "admin",
    permissions: ["*"],
    is_active: true
  });
}

async function loginWithEmailPassword(email, password) {
  const normalizedEmail = String(email || "").toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user || !user.is_active) {
    const err = new Error("Invalid credentials.");
    err.statusCode = 401;
    throw err;
  }

  const isPasswordValid = await bcrypt.compare(password || "", user.password_hash);
  if (!isPasswordValid) {
    const err = new Error("Invalid credentials.");
    err.statusCode = 401;
    throw err;
  }

  const token = signJwt({
    userId: user._id.toString(),
    role: user.role
  });

  return {
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions
    }
  };
}

function toMePayload(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    permissions: user.permissions
  };
}

module.exports = { ensureDefaultAdmin, loginWithEmailPassword, toMePayload };
