import mongoose from "mongoose";
import { boards_enum } from "../utils/constants.utils.js";

const coursesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      // required: true,
      trim: true,
    },

    courseType: {
      type: String,
      enum: ["school", "professional"],
      default: "school",
    },

    subject: {
      type: String,
      default: null,
    },

    standard: {
      type: String,
      default: null,
    },

    stream: {
      type: String,
      enum: ["SCIENCE", "ARTS", "COMMERCE", null],
      default: null,
    },

    board: {
      type: String,
      enum: boards_enum,
      default: null,
    },

    description: {
      type: String,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // required: true,
    },
  },
  {
    timestamps: true,
  },
);

// pre-save hook in Course model
coursesSchema.pre("save", function () {
  if (this.courseType === "school") {
    this.name = `${this.subject} - Class ${this.standard} ${this.board}`;
    // → "PHYSICS - Class 7 ICSE"
  }
  // professional courses still need a manual name
  // → "Spoken English", "WBCS Prep"
});

const Course = mongoose.model("Course", coursesSchema);
export default Course;
