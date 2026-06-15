import Batch from "../models/batch.models.js";
import Consultation from "../models/consultation.models.js";
import Exam from "../models/exam.models.js";
import Salary from "../models/salary.models.js";
import Student from "../models/student.models.js";
import ApiError from "../utils/ApiError.utils.js";
import ApiResponse from "../utils/ApiResponse.utils.js";
import asyncHandler from "../utils/asyncHandler.utils.js";

// *** Admin DashBoard *** \\;

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

  console.log("PENDING ACCOUNTS ARRAY ===>", pending_accounts_array);

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

  /****************** Total-Over Due amount and pending fees ******************/
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

  /****************** First Result ******************/

  const row_1 = {
    total_batches: batch_number,
    total_students: student_numbers,
    pending_amount_count,
    total_pending_amount,
    overDue_amount_count,
    total_overDue_amount,
  };

  /****************** Upcoming Exams ******************/

  const now = new Date();
  const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const exams = await Exam.find({
    date: { $gte: now, $lte: sevenDaysLater },
  })
    .select("title date batch")
    .populate("batch", "name")
    .sort({ date: 1 });
  const total_exams = exams.length;

  /***************** Over Due Student *****************/
  let student_due = [];

  all_students.map((x) => {
    const r = x.feeHistory.map((a) => {
      if (a.status == "overdue") {
        student_due.push(x);
      }
    });
  });

  /***************** Consultation *****************/

  const consultations = await Consultation.find({
    status: "pending",
  });

  const pending_consultation_counts = await consultations.length;

  /***************** Row-2 *****************/

  const row_2 = {
    exams,
    total_exams,
    student_due,
    pending_consultation_counts,
  };
  /***************** Salary *****************/

  const salary = await Salary.find({
    status: "pending",
  }).populate("user", "name userName email");

  /***************** Row-3 *****************/

  const row_3 = {
    pending_salary: salary,
  };

  /********************** Result **********************/

  const result = { row_1, row_2, row_3 };

  /****************************************************/
  return res
    .status(200)
    .json(new ApiResponse(200, result, "ADMIN DASH BOARD."));
});
