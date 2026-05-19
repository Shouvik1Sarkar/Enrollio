import Student from "../models/student.models.js";
import ApiError from "../utils/ApiError.utils.js";
import ApiResponse from "../utils/ApiResponse.utils.js";
import asyncHandler from "../utils/asyncHandler.utils.js";

export const addFeeRecord = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(403, "User not Logged In.");
  }

  const { student_id } = req.params;
  const { note } = req.body;

  const now = new Date();

  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const dueDate = new Date(now.getFullYear(), now.getMonth(), 10);

  const student = await Student.findById(student_id);
  if (!student) {
    throw new ApiError(400, "Student not found.");
  }

  if (student.enrolledBatches.length == 0) {
    throw new ApiError(400, "Student not enrolled to any batches.");
  }
  for (const batch of student.enrolledBatches) {
    // skip if this batch already has a record for this month
    const alreadyExists = student.feeHistory.some(
      (f) => f.month === month && f.batch.toString() === batch._id.toString(),
    );
    if (alreadyExists) continue; // skip, don't throw — other batches still need records

    student.feeHistory.push({
      batch: batch._id, // ← which batch
      amount: batch.monthlyFees, // ← that batch's fee
      month,
      dueDate,
      status: "pending",
      note: note ?? null,
    });
  }

  const student1 = await Student.findById(student_id).populate(
    "feeHistory.batch",
    "name monthlyFees",
  ); // ← name shows up here

  if (!student1) throw new ApiError(404, "Student not found.");

  return res
    .status(201)
    .json(new ApiResponse(201, student1.feeHistory, "Fee records added."));
});

export const feeById = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(403, "User not logged In.");
  }

  const { student_id, fee_id } = req.params;

  const student = await Student.findById(student_id).populate(
    "feeHistory.batch",
    "name monthlyFees",
  );
  if (!student) {
    throw new ApiError(400, "Student not found.");
  }

  const fee = student.feeHistory.id(fee_id);

  if (!fee) {
    throw new ApiError(400, "Fee not found");
  }

  return res.status(200).json(new ApiResponse(200, fee, "Fee not found"));
});

export const markFeePaid = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(403, "User not logged In.");
  }

  const { student_id } = req.params;
  const { note } = req.body;

  const student = await Student.findById(student_id);
  if (!student) {
    throw new ApiError(401, "Student not found");
  }

  student.feeHistory.forEach((record) => {
    if (record.status == "paid") {
      throw new ApiError(401, "Fees paid.");
    }
    record.status = "paid";
    record.paidAt = new Date();
    record.collectedBy = user._id;
    record.note = note ?? "";
  });

  await student.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, student.feeHistory, "Fee marked as paid."));
});

export const markEachFeePaid = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(403, "User not logged In.");
  }

  const { student_id, fee_id } = req.params;
  const { note } = req.body;

  const student = await Student.findById(student_id);
  if (!student) {
    throw new ApiError(401, "Student not found");
  }

  const fees = await student.feeHistory.id(fee_id);
  if (!fees) {
    throw new ApiError(400, "Fees Not Found.");
  }

  if (fees.status == "paid") {
    throw new ApiError(400, "Fees already.");
  }

  fees.status = "paid";
  fees.paidAt = new Date();
  fees.collectedBy = user._id;
  fees.note = note ?? "";
  await student.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, student, "fees paid."));
});

export const getStudentFeeHistory = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(403, "User not logged In.");
  }

  const { student_id } = req.params;

  const student = await Student.findById(student_id).populate({
    path: "feeHistory.batch",
    select: "name",
  });
  if (!student) {
    throw new ApiError(401, "Student not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, student.feeHistory, "Fee History."));
});

export const getStudentBalance = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(403, "User not logged In.");
  }

  const { student_id } = req.params;

  const student = await Student.findById(student_id);

  if (!student) {
    throw new ApiError(401, "Student not found");
  }

  let totalPaid = 0;
  let totalPending = 0;
  let overdue = [];

  const now = new Date();

  student.feeHistory.forEach((record) => {
    console.log("record:", record);
    if (record.status == "paid") {
      totalPaid += record.amount;
    } else {
      if (record.dueDate < now) {
        overdue.push(record);
      } else {
        totalPending += record.amount;
      }
    }
  });

  return res.status(200).json(
    new ApiResponse(
      200,

      {
        total_fees: student.total_fees, // monthly obligation
        totalPaid, // sum of all paid records
        totalPending, // sum of all pending records
        // balance: totalPending, // what's still owed
        overdueCount: overdue.length, // how many are overdue
        overdue, // the actual overdue records
      },

      "fees not found.",
    ),
  );
});
