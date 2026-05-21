// models/salary.models.js
import mongoose from "mongoose";

const salarySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // works for both teacher and admin
    },

    amount: {
      type: Number,
      required: true, // fixed salary set by owner
    },

    month: {
      type: String, // "2026-05"
      required: true,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["paid", "pending", "overdue"],
      default: "pending",
    },

    paidAt: {
      type: Date,
      default: null,
    },

    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // owner/admin who marked it paid
      default: null,
    },

    note: {
      type: String,
      default: null,
      trim: true,
    },
  },
  { timestamps: true },
);

// prevent duplicate salary record for same user + month
salarySchema.index({ user: true, month: true }, { unique: true });

const Salary = mongoose.model("Salary", salarySchema);
export default Salary;
