const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    module: {
      type: String,
      required: true,
      trim: true
    },
    action: {
      type: String,
      required: true,
      trim: true
    },
    entityType: {
      type: String,
      default: "",
      trim: true
    },
    entityId: {
      type: String,
      default: "",
      trim: true
    },
    status: {
      type: String,
      enum: ["success", "failure"],
      default: "success"
    },
    performedBy: {
      userId: {
        type: String,
        default: ""
      },
      email: {
        type: String,
        default: ""
      },
      role: {
        type: String,
        default: ""
      }
    },
    requestMeta: {
      ipAddress: {
        type: String,
        default: ""
      },
      userAgent: {
        type: String,
        default: ""
      }
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
