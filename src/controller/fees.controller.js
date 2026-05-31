import Batch from "../models/batch.models.js";
import Exam from "../models/exam.models.js";
import Student from "../models/student.models.js";
import ApiError from "../utils/ApiError.utils.js";
import ApiResponse from "../utils/ApiResponse.utils.js";
import asyncHandler from "../utils/asyncHandler.utils.js";

export const addFeeRecord = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(401, "User not Logged In.");
  }

  const { student_id } = req.params;
  const { note } = req.body;

  const now = new Date();

  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const dueDate = new Date(now.getFullYear(), now.getMonth(), 10);

  const student = await Student.findById(student_id);
  if (!student) {
    throw new ApiError(404, "Student not found.");
  }

  if (student.enrolledBatches.length == 0) {
    throw new ApiError(400, "Student not enrolled to any batches.");
  }

  for (const batch of student.enrolledBatches) {
    const alreadyExists = student.feeHistory.some(
      (f) => f.month === month && f.batch.toString() === batch._id.toString(),
    );

    if (alreadyExists) continue;

    student.feeHistory.push({
      batch: batch._id,
      amount: batch.monthlyFees,
      month,
      dueDate,
      status: "pending",
      note: note ?? null,
    });
  }

  await student.save({ validateBeforeSave: false });

  const student1 = await Student.findById(student_id).populate(
    "feeHistory.batch",
    "name monthlyFees",
  ); // ← name shows up here

  if (!student1) {
    throw new ApiError(404, "Student not found.");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, student1.feeHistory, "Fee records added."));
});

export const addSingleFeeRecord = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(401, "User not logged in.");
  }

  const { student_id, batch_id } = req.params;
  const { note } = req.body;

  const now = new Date();

  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const dueDate = new Date(now.getFullYear(), now.getMonth(), 10);

  const student = await Student.findById(student_id);
  if (!student) {
    throw new ApiError(404, "Student not found.");
  }

  if (student.enrolledBatches.length == 0) {
    throw new ApiError(400, "Student not enrolled to any batches.");
  }

  const batch = await Batch.findById(batch_id);
  if (!batch) {
    throw new ApiError(404, "Batch not found");
  }

  const alreadyExists = student.feeHistory.some(
    (f) => f.month === month && f.batch.toString() === batch._id.toString(),
  );

  if (alreadyExists) {
    throw new ApiError(409, "Fee record already exists.");
  }

  student.feeHistory.push({
    batch: batch_id, // ← which batch
    amount: batch.monthlyFees, // ← that batch's fee
    month,
    dueDate,
    status: "pending",
    note: note ?? null,
  });

  await student.save({ validateBeforeSave: false });

  // for (const batch of student.enrolledBatches) {
  //   // skip if this batch already has a record for this month
  //   const alreadyExists = student.feeHistory.some(
  //     (f) => f.month === month && f.batch.toString() === batch._id.toString(),
  //   );

  //   if (alreadyExists) continue; // skip, don't throw — other batches still need records

  //   student.feeHistory.push({
  //     batch: batch._id, // ← which batch
  //     amount: batch.monthlyFees, // ← that batch's fee
  //     month,
  //     dueDate,
  //     status: "pending",
  //     note: note ?? null,
  //   });
  // }

  const student1 = await Student.findById(student_id).populate(
    "feeHistory.batch",
    "name monthlyFees",
  ); // ← name shows up here

  if (!student1) {
    throw new ApiError(404, "Student not found.");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, student1.feeHistory, "Fee records added."));
});

export const feeById = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(401, "User not logged in.");
  }

  const { student_id, fee_id } = req.params;

  const student = await Student.findById(student_id).populate(
    "feeHistory.batch",
    "name monthlyFees",
  );
  if (!student) {
    throw new ApiError(404, "Student not found.");
  }

  const fee = student.feeHistory.id(fee_id);

  if (!fee) {
    throw new ApiError(404, "Fee not found");
  }

  return res.status(200).json(new ApiResponse(200, fee, "Fee found."));
});

export const markFeePaid = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(401, "User not logged In.");
  }

  const { student_id } = req.params;
  const { note } = req.body;

  const student = await Student.findById(student_id);
  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  const unpaid = student.feeHistory.filter((r) => r.status !== "paid");
  if (unpaid.length === 0) throw new ApiError(400, "All fees already paid.");

  unpaid.forEach((record) => {
    record.status = "paid";
    record.paidAt = new Date();
    record.collectedBy = user._id;
    record.note = note ?? null;
  });
  await student.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, student.feeHistory, "Fee marked as paid."));
});

export const markEachFeePaid = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(401, "User not logged in.");
  }

  const { student_id, fee_id } = req.params;
  const { note } = req.body;

  const student = await Student.findById(student_id);
  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  const fees = student.feeHistory.id(fee_id);
  if (!fees) {
    throw new ApiError(404, "Fee record not found.");
  }

  if (fees.status === "paid") {
    throw new ApiError(409, "Fee is already marked as paid.");
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
    throw new ApiError(401, "User not logged in.");
  }

  const { student_id } = req.params;

  const student = await Student.findById(student_id).populate({
    path: "feeHistory.batch",
    select: "name",
  });
  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, student.feeHistory, "Fee History."));
});

export const getStudentBalance = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(401, "User not logged in.");
  }

  const { student_id } = req.params;

  const student = await Student.findById(student_id);

  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  let totalPaid = 0;
  let totalPending = 0;
  let overdue = [];

  const now = new Date();

  student.feeHistory.forEach((record) => {
    // console.log("record:", record);
    if (record.status === "paid") {
      totalPaid += record.amount;
    } else {
      if (record.dueDate < now) {
        totalOverdue += record.amount;
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
        balance: totalPending + totalOverdue,
        overdue, // the actual overdue records
      },

      "fees not found.",
    ),
  );
});

// export const deleteFeeRecord = asyncHandler(async (req, res) => {
//   const { student_id, fee_id } = req.params;

//   const astudent = await Student.findById(student_id);

//   if (!astudent) {
//     throw new ApiError(400, "Student not found.");
//   }

//   const fee = await astudent.feeHistory.id(fee_id);
//   if (!fee) {
//     throw new ApiError(400, "Fee not found");
//   }

//   const student = await Student.findByIdAndUpdate(student_id, {
//     $inc: { total_fees: -fee.amount },
//   });
//   if (!student) throw new ApiError(404, "Student not found.");

//   const feeRecord = student.feeHistory.id(fee_id);
//   if (!feeRecord) throw new ApiError(404, "Fee record not found.");

//   student.feeHistory.pull({ _id: fee_id });
//   await student.save({ validateBeforeSave: false });

//   return res
//     .status(200)
//     .json(new ApiResponse(200, null, "Fee record deleted."));
// });

export const deleteFeeRecord = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(401, "User not logged in.");
  }

  if (!["admin", "super_admin"].includes(user.role)) {
    throw new ApiError(403, "Only admin or super admin can delete.");
  }

  const { student_id, fee_id } = req.params;

  const student = await Student.findById(student_id);
  if (!student) throw new ApiError(404, "Student not found.");

  const fee = student.feeHistory.id(fee_id); // no await — not async
  if (!fee) throw new ApiError(404, "Fee not found.");

  student.feeHistory.pull({ _id: fee_id });
  student.total_fees -= fee.amount;
  await student.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Fee record deleted."));
});
