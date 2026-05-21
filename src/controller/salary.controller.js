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
