import mongoose from "mongoose";
import { test_types_enum } from "../utils/constants.utils.js";
const examSchema = new mongoose.Schema(
  {
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },

    title: {
      type: String, // "Class Test 1", "Unit Test - May"
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
    },

    totalMarks: {
      type: Number,
      required: true, // out of how much
    },

    passingMarks: {
      type: Number,
      required: true,
    },

    testType: {
      type: String,
      enum: test_types_enum,
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

// prevent duplicate exam title for same batch on same date
examSchema.index({ batch: true, title: true, date: true }, { unique: true });
const Exam = mongoose.model("Exam", examSchema);
export default Exam;
