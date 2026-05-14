import mongoose from "mongoose";

const remarksSchema = new mongoose.Schema(
  {
    remarksBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher", // teacher who remarked.
      required: true,
    },

    remarksFor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student", // the student
      required: true,
    },

    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch", // which subject/batch this remark is about
      required: true,
    },

    month: {
      type: String, // "2025-03" — same pattern as salary
      required: true,
    },

    remark: {
      type: String, // the actual remark text
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
);

const Remarks = mongoose.model("Remarks", remarksSchema);
export default Remarks;
