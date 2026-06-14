import Attendance from "../models/attendance.models.js";
import ApiError from "../utils/ApiError.utils.js";
import asyncHandler from "../utils/asyncHandler.utils.js";

/ *** CREATE ATTENDANCE *** /;

export const createAttendance = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(400, "User not logged In.");
  }

  if (user.role === "student") {
    throw new ApiError(400, "Student can not set attendance.");
  }

  const { batch_id } = req.params;
  const attendance = await Attendance.create({
    batch,
    student,
    teacher,
    date,
    month,
    status,
    note,
  });
});
