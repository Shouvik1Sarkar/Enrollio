// ***Teacher Salary***

import redisClient from "../../config/redis.config.js";
import Admin from "../models/admin.models.js";
import Salary from "../models/salary.models.js";
import Teacher from "../models/teacher.models.js";
import User from "../models/user.models.js";
import ApiError from "../utils/ApiError.utils.js";
import ApiResponse from "../utils/ApiResponse.utils.js";
import asyncHandler from "../utils/asyncHandler.utils.js";
import logger from "../utils/logger.utils.js";

// *** SET SALARY *** \\

export const set_salary = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(401, "User not logged in.");
  }

  //   const { note } = req.body;

  const { user_id } = req.params;

  const get_user = await User.findById(user_id);

  if (!get_user) {
    throw new ApiError(404, "User not found.");
  }
  let teacher;
  let admin;

  if (get_user.role === "teacher") {
    teacher = await Teacher.findOne({
      userId: get_user._id,
    });
    // console.log("SALARY: ", teacher);
    logger.debug({ teacher }, "Salary");
    if (!teacher) {
      throw new ApiError(404, "Teacher not found.");
    }
    if (!teacher.salary)
      throw new ApiError(400, "Teacher has no base salary set. Set it first.");
  } else if (get_user.role === "admin") {
    admin = await Admin.findOne({
      userId: get_user._id,
    });
    if (!admin) {
      if (!admin) {
        throw new ApiError(404, "Admin not found.");
      }
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

  if (get_user.role == "teacher") {
    teacher.salaryRecord.push(salary);
    await teacher.save();
  } else {
    admin.salaryRecord.push(salary);
    await admin.save();
  }

  if (!salary) {
    throw new ApiError(500, "Salary not created.");
  }
  return res.status(200).json(new ApiResponse(200, salary, "Salary created."));
});

// *** PAID SALARY *** \\

export const paid_salary = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(401, "User not logged in.");
  }

  const { user_id } = req.params;
  const { note } = req.body || {};
  const get_user = await User.findById(user_id);

  if (!get_user) {
    throw new ApiError(404, "User not found.");
  }

  let teacher;
  let admin;
  if (get_user.role === "teacher") {
    teacher = await Teacher.findOne({
      userId: get_user._id,
    });
    if (!teacher) {
      throw new ApiError(404, "Teacher not found");
    }
  } else if (get_user.role === "admin") {
    admin = await Admin.findOne({
      userId: get_user._id,
    });
    if (!admin) {
      throw new ApiError(404, "Admin not found");
    }
  }

  const now = new Date();

  const salary = await Salary.find({ user: user_id });

  if (!salary) {
    throw new ApiError(404, "Salary not found");
  }

  salary.map((s) => {
    if (s.status === "paid") {
      throw new ApiError(409, "Salary already paid");
    }
    s.status = "paid";
    s.paidAt = now;
    s.paidBy = user._id;
    s.note = note || undefined;
  });

  await salary.save({
    validateBeforeSave: false,
  });

  //   teacher.salaryRecord.push(salary);
  //   await teacher.save({ validateBeforeSave: false });

  return res.status(201).json(new ApiResponse(201, salary, "salary paid."));
});
// *** PAID SALARY *** \\

export const paid_salary_id = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(401, "User not logged in.");
  }

  const { user_id } = req.params;
  const { note } = req.body || {};
  const { salary_id } = req.params;
  const get_user = await User.findById(user_id);

  if (!get_user) {
    throw new ApiError(404, "User not found.");
  }

  let teacher;
  let admin;
  if (get_user.role === "teacher") {
    teacher = await Teacher.findOne({
      userId: get_user._id,
    });
    if (!teacher) {
      throw new ApiError(404, "Teacher not found");
    }
  } else if (get_user.role === "admin") {
    admin = await Admin.findOne({
      userId: get_user._id,
    });
    if (!admin) {
      throw new ApiError(404, "Admin not found");
    }
  }

  const now = new Date();

  const salary = await Salary.findById(salary_id);

  if (!salary) {
    throw new ApiError(404, "Salary not found");
  }

  if (salary.status === "paid") {
    throw new ApiError(409, "Salary already paid");
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

// *** SALARY HISTORY *** \\

export const salary_history = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(401, "User not logged in.");
  }

  const { user_id } = req.params;

  const get_user = await User.findById(user_id);

  if (!get_user) {
    throw new ApiError(404, "User not found.");
  }

  // if (!["teacher", "admin"].includes(get_user.role)) {
  //   throw new ApiError(403, "User is not a teacher or admin.");
  // }

  // const teacher = await Teacher.findOne({
  //   userId: user_id,
  // });

  // if (!teacher) {
  //   throw new ApiError(404, "Teacher not found.");
  // }

  if (get_user.role === "teacher") {
    const teacher = await Teacher.findOne({ userId: user_id });

    if (!teacher) {
      throw new ApiError(404, "Teacher not found.");
    }
  } else if (get_user.role === "admin") {
    const admin = await Admin.findOne({ userId: user_id });

    if (!admin) {
      throw new ApiError(404, "Admin not found.");
    }
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

// *** GET ALL SALARIES *** \\

export const getAllSalaries = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(401, "User not logged in.");
  }

  if (!["super_admin", "admin"].includes(user.role)) {
    throw new ApiError(403, "Only admins can view salaries.");
  }

  const salaries = await Salary.find();
  // if (!salaries) {
  //   throw new ApiError(400, "Salaries found.");
  // }

  return res.status(200).json(new ApiResponse(200, salaries, "Salary found."));
});

// *** DELETE SALARY RECORD *** \\

export const deleteSalaryRecord = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(401, "User not logged in.");
  }

  if (!["super_admin", "admin"].includes(user.role)) {
    throw new ApiError(
      403,
      "Only admin or super admin can delete salary records.",
    );
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

// *** MY SALARY *** \\

export const my_salary = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(401, "User not logged in.");
  }

  const userId = user._id;

  const getUser = await User.findById(userId);
  if (!getUser) {
    throw new ApiError(403, "User not found.");
  }

  // const userId = req.user._id;
  const cachedKey = `Salary:${userId}`;
  let cachedMe;

  try {
    cachedMe = await redisClient.get(cachedKey);
  } catch (err) {
    console.log("Redis error, fallback to DB");
  }

  if (cachedMe) {
    return res
      .status(200)
      .json(new ApiResponse(200, JSON.parse(cachedMe), "*My Salary.*"));
  }

  let salary = [];
  if (getUser.role == "teacher") {
    const teacher = await Teacher.findOne({ userId: getUser._id }).populate(
      "salaryRecord",
      "user amount month dueDate status paidAt paidBy",
    );
    if (!teacher) {
      throw new ApiError(404, "Teacher not found.");
    }
    // salary.push()

    console.log("salary", teacher);

    console.log("TEACHER SALARY -> ", teacher.salaryRecord);
    teacher.salaryRecord.map((f) => {
      salary.push(f);
    });
  } else if (getUser.role == "admin") {
    const admin = await Admin.findOne({ userId: getUser._id });
    if (!admin) {
      throw new ApiError(404, "Teacher not found.");
    }
    admin.salaryRecord.map((f) => {
      salary.push(f);
    });
  }

  try {
    await redisClient.setEx(cachedKey, 60 * 20, JSON.stringify(salary));
  } catch (err) {
    console.log("Redis set failed");
  }

  return res.status(200).json(new ApiResponse(200, salary, "My salary"));
});

// ____________________________________
// ||||||||||||||||||||||||||||||||||||      ____
// ||||||||||||||||||||||||||||||||||||      ‾‾‾‾
// |||||||‾\\‾‾|||‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
// |||||||  \\_|||
// |||||||||||||||
// |||||||‾‾‾‾‾‾‾‾
// |||||||
// |||||||
// ‾‾‾‾‾‾‾

// ______________________________________
// |************************************|     ____
// |************************************|     ‾‾‾‾
// |******|‾\\‾‾|**|‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
// |******|  \\_|**|
// |***************|
// |******|‾‾‾‾‾‾‾‾‾
// |******|
// |******|
// ‾‾‾‾‾‾‾‾
