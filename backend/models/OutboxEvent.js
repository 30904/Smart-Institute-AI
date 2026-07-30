const mongoose = require("mongoose");

const outboxEventSchema = new mongoose.Schema(
  {
    event: {
      type: String,
      required: true,
      trim: true
    },
    deduplication_key: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    occurred_at: {
      type: Date,
      required: true
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    delivery_status: {
      type: String,
      enum: ["pending", "processing", "delivered", "failed"],
      default: "pending"
    },
    delivery_attempts: {
      type: Number,
      default: 0,
      min: 0
    },
    last_error: {
      type: String,
      default: "",
      trim: true
    }
  },
  {
    timestamps: true
  }
);

outboxEventSchema.index({ delivery_status: 1, createdAt: 1 });

module.exports = mongoose.model("OutboxEvent", outboxEventSchema);
