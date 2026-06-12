import mongoose from "mongoose";
import authorizeRoles from "../middleware/authorizeRoles.middleware.js";

const adminSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    salary: {
      type: Number,
      default: null, // base monthly salary set by admin
    },

    salaryRecord: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Salary",
      },
    ],
  },
  { timestamps: true },
);

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
