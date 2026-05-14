import mongoose from "mongoose";

const feesSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch", // which batch/subject this fee is for
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    month: {
      type: String, // "2025-03" — consistent with Marks and Remarks
      required: true,
    },

    dueDate: {
      type: Date,
      required: true, // when it should be paid by
    },

    status: {
      type: String,
      enum: ["paid", "pending", "overdue"],
      default: "pending",
      required: true,
    },

    paidAt: {
      type: Date,
      default: null, // filled when marked paid
    },

    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher", // for per-teacher fee model
      default: null, // null = centralized (admin collected)
    },

    note: {
      type: String,
      default: null,
      trim: true, // "partial payment", "discount given" etc
    },
  },
  { timestamps: true },
);

const Fees = mongoose.model("Fees", feesSchema);
export default Fees;
