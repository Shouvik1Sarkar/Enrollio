import mongoose from "mongoose";

const salaryRecordSchema = new mongoose.Schema(
  {
    month: {
      type: String, // "2025-01", "2025-02" — easy to query
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["paid", "pending"],
      default: "pending",
    },
    paidAt: {
      type: Date,
      default: null, // filled when marked paid
    },
  },
  { _id: false },
);

const teacherSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one teacher profile per user
    },

    education: [
      {
        type: String,
        trim: true,
      },
    ],

    experience: [
      {
        type: String,
        trim: true,
      },
    ],

    // what subjects this teacher is qualified to teach
    // actual teaching happens through Batch
    subjects: [
      {
        type: String,
        trim: true,
      },
    ],

    enrolledBatches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Batch",
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    salary: {
      type: Number,
      default: null, // base monthly salary set by admin
    },

    salaryHistory: [salaryRecordSchema], // full monthly history
  },
  { timestamps: true },
);

const Teacher = mongoose.model("Teacher", teacherSchema);
export default Teacher;
