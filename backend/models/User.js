const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      default: "",
      trim: true
    },
    password_hash: {
      type: String,
      required: true
    },
    role_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      default: null
    },
    department_id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    linked_faculty_id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    linked_student_id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    role: {
      type: String,
      default: ""
    },
    permissions: {
      type: [String],
      default: []
    },
    is_active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);
