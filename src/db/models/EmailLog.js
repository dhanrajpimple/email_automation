const mongoose = require("mongoose");

const emailLogSchema = new mongoose.Schema(
  {
    toEmail: { type: String, required: true, lowercase: true, trim: true },
    type: { type: String, required: true, enum: ["normal", "freelancing"] },
    subject: { type: String },
    status: {
      type: String,
      required: true,
      enum: ["pending", "sent", "failed"],
      default: "pending",
    },
    messageId: { type: String },
    errorMessage: { type: String },
    sentAt: { type: Date },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

emailLogSchema.index({ toEmail: 1, type: 1 }, { unique: true });

module.exports = mongoose.model("EmailLog", emailLogSchema);
