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

export const markFeePaid = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(401, "User not logged In.");
  }
  const { student_id, fee_id } = req.params;

  const student = await Student.findOne({
    userId: user._id,
  });

  if (!student) {
    throw new ApiError(400, "Student not found.");
  }

  const feeRecord = student.feeHistory.id(fee_id);
  if (!feeRecord) throw new ApiError(404, "Fee record not found.");

  if (feeRecord.status === "paid") {
    throw new ApiError(400, "Fee already marked as paid.");
  }

  // update the fields
  feeRecord.status = "paid";
  feeRecord.paidAt = new Date();
  feeRecord.collectedBy = user._id;
  //   feeRecord.note = note ?? feeRecord.note;

  await student.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, feeRecord, "Fee marked as paid."));
});

export const getStudentFeeHistory = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(401, "User not logged In.");
  }
  const { student_id } = req.params;

  const student = await Student.findOne({
    userId: user._id,
  }).select("feeHistory total_fees");

  if (!student) {
    throw new ApiError(400, "Student not found.");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        feeHistory: student.feeHistory,
        total_fees: student.total_fees,
      },
      "Fee Story.",
    ),
  );
});

export const getStudentBalance = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(403, "User not logged in.");
  }

  const { student_id } = req.params;
  const student = await Student.findById(student_id);

  if (!student) {
    throw new ApiError(400, "Student not found.");
  }

  let totalPaid = 0;
  let totalPending = 0;
  let overdue = [];

  const now = new Date();

  student.feeHistory.forEach((record) => {
    if (record.status == "paid") {
      totalPaid += record.amount;
    } else if (record.dueDate > now) {
      overdue.push(record);
    } else {
      totalPending += record.amount;
    }
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        total_fees: student.total_fees, // monthly obligation
        totalPaid, // sum of all paid records
        totalPending, // sum of all pending records
        balance: totalPending, // what's still owed
        overdueCount: overdue.length, // how many are overdue
        overdue, // the actual overdue records
      },
      "Balance fetched.",
    ),
  );
});

export const deleteFeeRecord = asyncHandler(async (req, res) => {
  const { student_id, fee_id } = req.params;

  const student = await Student.findById(student_id);
  if (!student) throw new ApiError(404, "Student not found.");

  const feeRecord = student.feeHistory.id(fee_id);
  if (!feeRecord) throw new ApiError(404, "Fee record not found.");

  student.feeHistory.pull({ _id: fee_id });
  await student.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Fee record deleted."));
});

export const feeById = asyncHandler(async (req, res) => {
  const { student_id, fee_id } = req.params; // need student_id too

  const student = await Student.findById(student_id);
  if (!student) throw new ApiError(404, "Student not found.");

  const fee = student.feeHistory.id(fee_id);
  if (!fee) throw new ApiError(404, "Fee record not found.");

  return res.status(200).json(new ApiResponse(200, fee, "Fee record fetched."));
});
