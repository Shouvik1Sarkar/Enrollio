import Batch from "../models/batch.models.js";
import Fees from "../models/fees.models.js";
import Student from "../models/student.models.js";
import ApiError from "../utils/ApiError.utils.js";
import ApiResponse from "../utils/ApiResponse.utils.js";
import asyncHandler from "../utils/asyncHandler.utils.js";
import logger from "../utils/logger.utils.js";

export const addFeeRecord = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(401, "User not logged In.");
  }

  const now = new Date();

  // month — auto generated
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  // → "2026-05"

  // dueDate — auto set to 10th of current month
  const dueDate = new Date(now.getFullYear(), now.getMonth(), 10);

  const status = "pending";
  //    let collectedBy = user._id,
  const { note } = req.body;

  const student = await Student.findOne({
    userId: user._id,
  });

  if (!student) {
    throw new ApiError(404, "User not found.");
  }

  const alreadyExists = student.feeHistory.some((f) => f.month === month);
  if (alreadyExists) {
    throw new ApiError(409, `Fee for ${month} already exists.`);
  }

  // push into embedded array — this IS the feeRecordSchema
  student.feeHistory.push({
    amount: student.total_fees,
    month,
    dueDate,
    status: "pending",
    note: note ?? null,
  });

  await student.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, student, "Students."));
});
