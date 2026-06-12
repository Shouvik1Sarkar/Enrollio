import Batch from "../models/batch.models.js";
import Student from "../models/student.models.js";
import Teacher from "../models/teacher.models.js";
import ApiError from "../utils/ApiError.utils.js";
import ApiResponse from "../utils/ApiResponse.utils.js";
import asyncHandler from "../utils/asyncHandler.utils.js";
import { available_user_roles } from "../utils/constants.utils.js";
import logger from "../utils/logger.utils.js";

export const createRemarks = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(401, "User not Logged In.");
  }
  const now = new Date();

  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const { studentId, batchId } = req.params;

  const { remark } = req.body;

  const student = await Student.findById(studentId).populate("enrolledBatches");

  if (!student) {
    throw new ApiError(404, "Student not found.");
  }

  const batch = await Batch.findById(batchId);

  if (!batch) {
    throw new ApiError(404, "Batch not found.");
  }

  if (batch.teacher !== user._id) {
    throw new ApiError(400, "Only teacher of this batch can give review.");
  }

  // correct array .find() with callback
  const existed_remark = student.remarkHistory.find(
    (r) => r.batch.toString() === batchId && r.month === month,
  );
  if (existed_remark) {
    throw new ApiError(409, "Remark already exists for this batch and month.");
  }

  student.remarkHistory.push({
    remarksBy: user._id,
    remarksFor: student._id,
    batch: batch._id,
    month,
    remark,
  });

  await student.save({ validateBeforeSave: false });

  return res
    .status(201)
    .json(new ApiResponse(201, student, "Student remarks."));
});

export const updateRemarks = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(401, "User not Logged In.");
  }

  if (user.role !== available_user_roles.TEACHER) {
    throw new ApiError(403, "Only teachers can update remarks.");
  }

  const { studentId, remarkId } = req.params;
  const { remark } = req.body;

  if (!remark || remark.trim() === "") {
    throw new ApiError(400, "Remark text is required.");
  }

  const teacher = await Teacher.findOne({
    userId: user._id,
  });

  if (!teacher) {
    throw new ApiError(404, "Teacher not found.");
  }

  const student = await Student.findById(studentId).populate("enrolledBatches");

  if (!student) {
    throw new ApiError(404, "Student not found.");
  }

  const existingRemark = student.remarkHistory.id(remarkId);

  console.log("existed -> ", existingRemark);

  if (!existingRemark) {
    throw new ApiError(404, "Remark not found.");
  }

  console.log("----------------", existingRemark.remarksBy.toString());
  console.log("----------------", teacher._id.toString());
  if (
    user.role === available_user_roles.TEACHER &&
    existingRemark.remarksBy.toString() !== teacher._id.toString()
  ) {
    throw new ApiError(403, "You can only edit your own remarks.");
  }

  existingRemark.remark = remark;

  await student.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, student.remarkHistory, "Student remarks."));
});

export const remarkById = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(401, "User not Logged In.");
  }
  if (
    ![
      available_user_roles.TEACHER,
      available_user_roles.ADMIN,
      available_user_roles.SUPER_ADMIN,
    ].includes(user.role)
  ) {
    throw new ApiError(403, "Only teachers or admins can update remarks.");
  }

  const { studentId, remarkId } = req.params;

  const student = await Student.findById(studentId).populate(
    "remarkHistory",
    "batch month remark",
  );
  if (!student) {
    throw new ApiError(404, "Student not found.");
  }

  const remark = student.remarkHistory.id(remarkId);

  if (!remark) {
    throw new ApiError(401, "remark not found.");
  }

  return res.status(200).json(new ApiResponse(200, remark, "Remark."));
});

export const deleteRemarks = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(401, "User not Logged In.");
  }

  if (
    ![
      available_user_roles.TEACHER,
      available_user_roles.ADMIN,
      available_user_roles.SUPER_ADMIN,
    ].includes(user.role)
  ) {
    throw new ApiError(403, "Only teachers or admins can update remarks.");
  }

  const { studentId, remarkId } = req.params;

  const student = await Student.findById(studentId).populate(
    "remarkHistory",
    "batch month remark",
  );

  if (!student) {
    throw new ApiError(404, "Student not found.");
  }

  student.remarkHistory.pull(remarkId);
  await student.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, remark, "Remark."));
});
