import Batch from "../models/batch.models.js";
import Teacher from "../models/teacher.models.js";
import User from "../models/user.models.js";
import ApiError from "../utils/ApiError.utils.js";
import ApiResponse from "../utils/ApiResponse.utils.js";
import asyncHandler from "../utils/asyncHandler.utils.js";
import { available_user_roles } from "../utils/constants.utils.js";

export const setupTeacherProfile = asyncHandler(async (req, res) => {
  const user = req.user;

  const myUser = await User.findById(user._id);

  if (!myUser) {
    throw new ApiError(400, "User not logged in.");
  }

  if (myUser.role !== available_user_roles.SUPER_ADMIN) {
    throw new ApiError(403, "Only Super admin can set up a teacher.");
  }

  const { education, experience, subjects, salary } = req.body;

  const { userId } = req.params;

  const userTeacher = await User.findById(userId);

  if (!userTeacher) {
    throw new ApiError(400, "User not found.");
  }

  const teacher = await Teacher.create({
    userId,
    education,
    experience,
    subjects,
    createdBy: req.user._id,
    salary,
  });

  if (!teacher) {
    throw new ApiError(400, "TEACHER NOT CREATED.");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, teacher, "Teacher Created."));
});

export const updateTeacher = asyncHandler(async (req, res) => {
  const user = req.user;

  const myUser = await User.findById(user._id);

  if (!myUser) {
    throw new ApiError(400, "User not logged in.");
  }

  if (myUser.role !== available_user_roles.SUPER_ADMIN) {
    throw new ApiError(403, "Only Super admin can set up a teacher.");
  }

  const { education, experience, subjects, salary } = req.body;

  const { userId } = req.params;

  const data = {};

  if (education) data.education = education;
  if (experience) data.experience = experience;
  if (subjects) data.subjects = subjects;
  if (salary) data.salary = salary;

  const userTeacher = await Teacher.findOneAndUpdate(
    { userId },
    {
      $set: data,
    },
    { new: true, runValidators: true },
  );

  if (!userTeacher) {
    throw new ApiError(400, "User not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, userTeacher, "Teacher updated."));
});

export const getMyBatches = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const batch = await Teacher.findOne({ userId: user._id });

  if (!batch) {
    throw new ApiError(400, "Batch not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, batch.enrolledBatches, "Batch updated."));
});

export const assignTeacherToBatch = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  // teacher;

  const { batchName } = req.body;
  const { teacher_id } = req.params;

  if (!batchName) {
    throw new ApiError(400, "Batch name not found.");
  }

  const batch = await Batch.findOne({
    name: batchName,
  });

  if (!batch) {
    throw new ApiError(403, "Batch not found.");
  }

  const teacher = await Teacher.findByIdAndUpdate(
    teacher_id,
    {
      $push: {
        enrolledBatches: batch._id,
      },
    },

    { new: true, runValidators: true },
  );
  if (!teacher) {
    throw new ApiError(403, "teacher not found.");
  }

  batch.teacher = teacher_id;

  await batch.save();

  return res
    .status(200)
    .json(new ApiResponse(200, teacher, "Teacher enrolled in batch."));
});

export const getTeacherById = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const { teacher_id } = req.params;

  const teacher = await Teacher.findById(teacher_id)
    .populate("userId", "name email")
    .populate("enrolledBatches", "name");

  if (!teacher) {
    throw new ApiError(404, "Tacher not found");
  }

  return res.status(200).json(new ApiResponse(200, teacher, "Teacher"));
});

// export const getTeacherBatches = asyncHandler(async (req, res) => {});

// export const getMyStudents = asyncHandler(async (req, res) => {
//   const user = req.user;

//   if (!user) {
//     throw new ApiError(404, "User not found.");
//   }

// });
