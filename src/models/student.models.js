import mongoose from "mongoose";
import { boards_enum } from "../utils/constants.utils.js";

// const feeRecordSchema = new mongoose.Schema(
//   {

//     // batch: [
//     //   {
//     //     type: mongoose.Schema.Types.ObjectId,
//     //     ref: "Batch",
//     //     required: true,
//     //   },
//     // ],

//     amount: {
//       type: Number,
//       required: true,
//     },
//     month: {
//       type: String, // "2026-05"
//       required: true,
//     },
//     dueDate: {
//       type: Date,
//       required: true,
//     },
//     status: {
//       type: String,
//       enum: ["paid", "pending", "overdue"],
//       default: "pending",
//     },
//     paidAt: {
//       type: Date,
//       default: null,
//     },
//     collectedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User", // admin who collected
//       default: null,
//     },
//     note: {
//       type: String,
//       default: null,
//       trim: true,
//     },
//   },
//   { _id: true }, // keep _id so you can update a specific record
// );

const feeRecordSchema = new mongoose.Schema(
  {
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    month: {
      type: String,
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
    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    note: {
      type: String,
      default: null,
      trim: true,
    },
  },
  { _id: true },
);

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // add this
    },

    studentType: {
      type: String,
      enum: ["school", "college", "professional"],
      required: true,
    },

    board: {
      type: String,
      enum: boards_enum,
      default: null,
    },

    standard: {
      type: String,
      default: null,
    },

    enrolledBatches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Batch",
      },
    ],

    stream: {
      type: String,
      enum: ["SCIENCE", "ARTS", "COMMERCE"],
      default: null,
    },

    learningMode: {
      type: String,
      enum: ["batch", "online", "home_tuition"],
      // required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    total_fees: {
      type: Number,
      default: 0,
    },

    feeHistory: [feeRecordSchema],
  },
  { timestamps: true },
);

const Student = mongoose.model("Student", studentSchema);
export default Student;
