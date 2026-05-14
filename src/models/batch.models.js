import mongoose from "mongoose";
import { days_enum, learning_modes_enum } from "../utils/constants.utils.js";

const batchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      // required: true,
      trim: true,
      // "Class 11 Physics CBSE - Morning A"
      // "Spoken English Batch B"
      // "WBCS Prep - Evening"
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true, // every batch must belong to a course
    },

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      // required: true, // every batch must have a teacher
    },

    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student", // all students in this batch
      },
    ],

    learningMode: {
      type: String,
      enum: learning_modes_enum,
      // required: true,
    },

    serial: {
      type: String,
    },

    // ── SCHEDULE ─────────────────────────────────
    schedule: {
      days: [
        {
          type: String,
          enum: days_enum,
          default: null,
        },
      ],
      startTime: { type: String, default: null }, // "09:00"
      endTime: { type: String, default: null }, // "10:30"
    },

    // ── DURATION ─────────────────────────────────
    startDate: {
      type: Date,
      // required: true, // when the batch starts
    },

    endDate: {
      type: Date,
      // default: null, // null = ongoing
    },

    // ── FEES ─────────────────────────────────────
    monthlyFees: {
      type: Number,
      required: true, // base fee for this batch per month
    },

    // ── STATUS ───────────────────────────────────
    isActive: {
      type: Boolean,
      default: true, // false = batch ended or paused
    },

    maxStudents: {
      type: Number,
      default: null, // null = no limit
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

const Batch = mongoose.model("Batch", batchSchema);
export default Batch;
