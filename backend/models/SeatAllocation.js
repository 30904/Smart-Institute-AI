const mongoose = require("mongoose");

const seatAllocationSchema = new mongoose.Schema(
  {
    cycle_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdmissionCycle",
      required: true
    },
    program_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
      required: true
    },
    application_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdmissionApplication",
      required: true
    },
    merit_list_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MeritList",
      required: true
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdmissionCategory",
      required: true
    },
    allocation_status: {
      type: String,
      enum: ["allotted", "waitlisted", "rejected"],
      required: true
    },
    selection_pool: {
      type: String,
      enum: ["reserved", "open", "waitlist"],
      required: true
    },
    pool_key: {
      type: String,
      required: true,
      trim: true
    },
    seat_number: {
      type: Number,
      min: 1,
      default: null
    },
    waitlist_position: {
      type: Number,
      min: 1,
      default: null
    },
    allotted_at: {
      type: Date,
      default: null
    },
    allocated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    approval_status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    approval_remarks: {
      type: String,
      default: "",
      trim: true
    },
    decided_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    decided_at: {
      type: Date,
      default: null
    },
    released_pool_key: {
      type: String,
      default: "",
      trim: true
    },
    released_seat_number: {
      type: Number,
      min: 1,
      default: null
    }
  },
  {
    timestamps: true
  }
);

seatAllocationSchema.index({ cycle_id: 1, program_id: 1, application_id: 1 }, { unique: true });
seatAllocationSchema.index(
  { cycle_id: 1, application_id: 1 },
  { unique: true, partialFilterExpression: { allocation_status: "allotted" } }
);
seatAllocationSchema.index(
  { cycle_id: 1, program_id: 1, pool_key: 1, seat_number: 1 },
  { unique: true, partialFilterExpression: { seat_number: { $type: "number" } } }
);
seatAllocationSchema.index(
  { cycle_id: 1, program_id: 1, waitlist_position: 1 },
  { unique: true, partialFilterExpression: { waitlist_position: { $type: "number" } } }
);

module.exports = mongoose.model("SeatAllocation", seatAllocationSchema);
