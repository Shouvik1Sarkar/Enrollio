import Batch from "../models/batch.models.js";
import Student from "../models/student.models.js";
import ApiError from "../utils/ApiError.utils.js";
import ApiResponse from "../utils/ApiResponse.utils.js";
import asyncHandler from "../utils/asyncHandler.utils.js";

export const adminDashBoard = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(401, "User Not Logged In.");
  }
  /****************** Number of Batches ******************/
  const allBatches = await Batch.find();

  const batch_number = allBatches.length;

  /****************** Number of Students ******************/
  const all_students = await Student.find();

  const student_numbers = all_students.length;

  /****************** Total Pending amount and pending fees ******************/
  const pending_accounts_array = all_students.map((x) => {
    const r = x.feeHistory.filter((a) => a.status == "pending");
    return r;
  });
  const pending_amount = pending_accounts_array.flat(Infinity);

  console.log("PENDING AMOUNT => ", pending_amount.flat(Infinity));

  const pending_amount_count = pending_amount.length;

  const total_pending_amount_array = pending_amount.map((s) => {
    return s.amount;
  });
  console.log("=======> ", total_pending_amount_array);

  const total_pending_amount = total_pending_amount_array.reduce(
    (acc, num) => acc + num,
    0,
  );
  console.log("=======> ", total_pending_amount);

  /****************** TotalOver Due amount and pending fees ******************/
  const overDue_accounts_array = all_students.map((x) => {
    const r = x.feeHistory.filter((a) => a.status == "overdue");
    return r;
  });
  const overDue_amount = overDue_accounts_array.flat(Infinity);

  console.log("OVER-DUE AMOUNT => ", pending_amount.flat(Infinity));

  const overDue_amount_count = overDue_amount.length;

  const total_overDue_amount_array = overDue_amount.map((s) => {
    return s.amount;
  });
  console.log("=======> ", total_overDue_amount_array);

  const total_overDue_amount = total_overDue_amount_array.reduce(
    (acc, num) => acc + num,
    0,
  );
  console.log("=======> ", total_overDue_amount);

  const result_1 = {
    total_batches: batch_number,
    total_students: student_numbers,
    pending_amount_count,
    total_pending_amount,
    overDue_amount_count,
    total_overDue_amount,
  };

  const result = { result_1 };

  return res
    .status(200)
    .json(new ApiResponse(200, result, "ADMIN DASH BOARD."));
});
