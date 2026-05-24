// ***Teacher Salary***

import Admin from "../models/admin.models.js";
import Salary from "../models/salary.models.js";
import Teacher from "../models/teacher.models.js";
import User from "../models/user.models.js";
import ApiError from "../utils/ApiError.utils.js";
import ApiResponse from "../utils/ApiResponse.utils.js";
import asyncHandler from "../utils/asyncHandler.utils.js";

export const set_salary = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(403, "User not logged In.");
  }

  //   const { note } = req.body;

  const { user_id } = req.params;

  const get_user = await User.findById(user_id);

  if (!get_user) {
    throw new ApiError(400, "User not found.");
  }
  let teacher;
  let admin;

  if (get_user.role === "teacher") {
    teacher = await Teacher.findOne({
      userId: get_user._id,
    });
    console.log("SALARY: ", teacher);
    if (!teacher) {
      throw new ApiError(400, "Teacher not found.");
    }
    if (!teacher.salary)
      throw new ApiError(400, "Teacher has no base salary set. Set it first.");
  } else if (get_user.role === "admin") {
    admin = await Admin.findOne({
      userId: get_user._id,
    });
    if (!admin) {
      throw new ApiError(400, "Teacher not found.");
    }
  }

  const now = new Date();

  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const dueDate = new Date(now.getFullYear(), now.getMonth(), 5);

  const salary = await Salary.create({
    user: user_id,
    amount: get_user.role == "teacher" ? teacher.salary : admin.salary,
    month,
    dueDate,
    status: "pending",
    // note: note || undefined,
  });

  if (!salary) {
    throw new ApiError(400, "Salary not created.");
  }

  return res.status(200).json(new ApiResponse(200, salary, "Salary created."));
});

export const paid_salary = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(403, "User not logged In.");
  }

  const { user_id } = req.params;
  const { note } = req.body || {};
  const get_user = await User.findById(user_id);

  if (!get_user) {
    throw new ApiError(400, "User not found.");
  }

  let teacher;
  let admin;
  if (get_user.role === "teacher") {
    teacher = await Teacher.findOne({
      userId: get_user._id,
    });
    if (!teacher) {
      throw new ApiError(401, "Teacher not found");
    }
  } else if (get_user.role === "admin") {
    admin = await Admin.findOne({
      userId: get_user._id,
    });
    if (!admin) {
      throw new ApiError(401, "Admin not found");
    }
  }

  const now = new Date();

  const salary = await Salary.findOne({ user: user_id });

  if (!salary) {
    throw new ApiError(400, "salary not found");
  }

  if (salary.status === "paid") {
    throw new ApiError(400, "salary already paid");
  }

  salary.status = "paid";
  salary.paidAt = now;
  salary.paidBy = user._id;
  salary.note = note || undefined;

  await salary.save({
    validateBeforeSave: false,
  });

  //   teacher.salaryRecord.push(salary);
  //   await teacher.save({ validateBeforeSave: false });

  return res.status(201).json(new ApiResponse(201, salary, "salary paid."));
});

export const salary_history = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(403, "User not logged In.");
  }

  const { user_id } = req.params;

  const get_user = await User.findById(user_id);

  if (!get_user) {
    throw new ApiError(400, "User not found.");
  }

  if (!["teacher", "admin"].includes(get_user.role)) {
    throw new ApiError(400, "User is not a teacher or admin.");
  }

  const teacher = await Teacher.findOne({
    userId: user_id,
  });

  if (!teacher) {
    throw new ApiError(400, "Teacher not found.");
  }

  const salaryHistory = await Salary.find({
    user: user_id,
  }).select("user amount month dueDate status paidAt paidBy");

  let paid_salary_record = [];
  let pending_salary_record = [];
  let overdue_salary_record = [];

  salaryHistory.forEach((e) => {
    if (e.status === "paid") {
      paid_salary_record.push(e);
    } else if (e.status === "pending") {
      pending_salary_record.push(e);
    } else {
      overdue_salary_record.push(e);
    }
  });

  //   console.log("SALARY HISTORY: ", salaryHistory);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        paid_salary_record,
        pending_salary_record,
        overdue_salary_record,
      },
      "Salary history.",
    ),
  );
});

export const getAllSalaries = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(403, "User not logged In.");
  }

  if (!["super_admin", "admin"].includes(user.role)) {
    throw new ApiError(400, "User is not a teacher or admin.");
  }

  const salaries = await Salary.find();
  if (!salaries) {
    throw new ApiError(400, "Salaries found.");
  }

  return res.status(200).json(new ApiResponse(200, salaries, "Salary found."));
});

export const deleteSalaryRecord = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(403, "User not logged In.");
  }

  if (!["super_admin", "admin"].includes(user.role)) {
    throw new ApiError(400, "User is not a teacher or admin.");
  }

  const { month } = req.params;

  const salaries = await Salary.find({
    month,
  });
  if (!salaries) {
    throw new ApiError(400, "Salaries found.");
  }

  return res.status(200).json(new ApiResponse(200, salaries, "Salary found."));
});

export const deleteSalaryRecord = asyncHandler(async (req, res) => {
  // ← fix name
  const user = req.user;
  if (!user) throw new ApiError(401, "User not logged in.");

  const { salary_id } = req.params;

  const salary = await Salary.findById(salary_id);
  if (!salary) throw new ApiError(404, "Salary not found.");

  await salary.deleteOne(); // cleaner than findByIdAndDelete after already fetching

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Salary record deleted."));
});
