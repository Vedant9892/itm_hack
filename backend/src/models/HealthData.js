const mongoose = require("mongoose");

const healthDataSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    heartRate: {
      type: Number,
      default: 0,
    },
    oxygenSaturation: {
      type: Number,
      default: 0,
    },
    respiratoryRate: {
      type: Number,
      default: 0,
    },
    steps: {
      type: Number,
      default: 0,
    },
    timestamp: {
      type: Date,
      required: true,
      index: true,
    },
    source: {
      type: String,
      enum: ["google_fit", "mock"],
      default: "google_fit",
    },
  },
  { timestamps: true }
);

healthDataSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model("HealthData", healthDataSchema);
