// models/consultation.models.js
import mongoose from "mongoose";

const consultationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true, // primary contact — more reliable than email
      trim: true,
    },
    email: {
      type: String,
      default: null,
      trim: true,
    },
    message: {
      type: String,
      default: null,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "contacted", "enrolled", "dropped"],
      default: "pending",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // admin who follows up
      default: null,
    },
  },
  { timestamps: true },
);

const Consultation = mongoose.model("Consultation", consultationSchema);
export default Consultation;
