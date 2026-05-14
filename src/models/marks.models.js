import mongoose from "mongoose";

const marksSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },

    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch", // carries subject, standard, board — no need to repeat
      required: true,
    },

    testName: {
      type: String, // "Class Test 1", "Monthly Test", "Final Exam"
      required: true,
      trim: true,
    },

    testType: {
      type: String,
      enum: ["class_test", "monthly_test", "final_exam", "mock_test"],
      required: true,
    },

    marksObtained: {
      type: Number,
      required: true,
    },

    maxMarks: {
      type: Number,
      required: true, // 45/50 vs 45/100 means very different things
    },

    month: {
      type: String, // "2025-03" — consistent with salary and remarks
      required: true,
    },

    remarks: {
      type: String, // optional short note from teacher on this test
      default: null,
      trim: true,
    },
  },
  { timestamps: true },
);

const Marks = mongoose.model("Marks", marksSchema);
export default Marks;
