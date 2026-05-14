import mongoose from "mongoose";
import { boards_enum } from "../utils/constants.utils.js";

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

    // learningMode: {
    //   type: String,
    //   enum: ["batch", "online", "home_tuition"],
    //   required: true,
    // },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

const Student = mongoose.model("Student", studentSchema);
export default Student;
