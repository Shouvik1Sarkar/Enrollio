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

  const allBatches = await Batch.find();

  const batch_number = allBatches.length;

  const all_students = await Student.find();

  const student_numbers = all_students.length;

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

  //   const fee_record = all_students.map((x) => x.feeHistory);

  //   console.log("PENDING AMOUNT => ", pending_amount.flat(Infinity));

  const result_1 = {
    total_batches: batch_number,
    total_students: student_numbers,
    pending_amount_count,
    total_pending_amount,
  };

  const result = { result_1 };

  return res
    .status(200)
    .json(new ApiResponse(200, result, "ADMIN DASH BOARD."));
});
