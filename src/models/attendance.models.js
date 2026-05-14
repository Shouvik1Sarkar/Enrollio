import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true, // which batch this attendance is for
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true, // who marked the attendance
    },

    date: {
      type: Date,
      required: true, // the specific class date
    },

    month: {
      type: String,
      required: true, // "2025-03" — consistent with Marks, Fees, Remarks
    },

    status: {
      type: String,
      enum: ["present", "absent", "late"],
      required: true,
    },

    note: {
      type: String,
      default: null,
      trim: true, // "left early", "came after 30 mins" etc
    },
  },
  { timestamps: true },
);

// prevents duplicate attendance for same student in same batch on same date
attendanceSchema.index({ batch: 1, student: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;
