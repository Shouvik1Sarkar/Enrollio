import redisClient from "../../config/redis.config.js";
import Batch from "../models/batch.models.js";
import Salary from "../models/salary.models.js";
import Teacher from "../models/teacher.models.js";
import User from "../models/user.models.js";
import ApiError from "../utils/ApiError.utils.js";
import ApiResponse from "../utils/ApiResponse.utils.js";
import asyncHandler from "../utils/asyncHandler.utils.js";
import { available_user_roles } from "../utils/constants.utils.js";

// ***SET-UP TEACHER*** \\

export const setupTeacherProfile = asyncHandler(async (req, res) => {
  const myUser = req.user;

  // const myUser = await User.findById(user._id);

  if (!myUser) {
    throw new ApiError(401, "Authentication required.");
  }

  if (myUser.role !== available_user_roles.SUPER_ADMIN) {
    throw new ApiError(403, "Only Super Admins can create teacher profiles.");
  }

  const { education, experience, subjects, salary } = req.body;

  const { userId } = req.params;

  const userTeacher = await User.findById(userId);

  if (!userTeacher) {
    throw new ApiError(404, "User not found.");
  }

  const teacher = await Teacher.create({
    userId,
    education,
    experience: experience || undefined,
    subjects,
    createdBy: req.user._id,
    salary: salary || undefined,
  });

  if (!teacher) {
    throw new ApiError(500, "Failed to create teacher profile.");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, teacher, "Teacher Created."));
});

// ***UPDATE TEACHER*** \\

export const updateTeacher = asyncHandler(async (req, res) => {
  const myUser = req.user;

  if (!myUser) {
    throw new ApiError(401, "Authentication required.");
  }

  if (myUser.role !== available_user_roles.SUPER_ADMIN) {
    throw new ApiError(403, "Only Super Admins can update teacher profiles.");
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
    throw new ApiError(404, "Teacher not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, userTeacher, "Teacher updated."));
});

// ***UPDATE SALARY*** \\

export const updateSalary = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(401, "Authentication required.");
  }

  const { teacher_id } = req.params;
  const { salary } = req.body;

  if (!salary || salary <= 0) {
    throw new ApiError(400, "Valid salary amount is required.");
  }
  const teacher = await Teacher.findById(teacher_id);

  if (!teacher) {
    throw new ApiError(404, "Teacher not found.");
  }
  teacher.salary = salary;
  await teacher.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, teacher, "Teacher Salary upsated."));
});

// ***GET MY BATCHES*** \\

export const getMyBatches = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(401, "Authentication required.");
  }

  const userId = user._id;
  const cachedKey = `all_my_batches:${userId}`;
  let cachedMe;

  try {
    cachedMe = await redisClient.get(cachedKey);
  } catch (err) {
    console.log("Redis error, fallback to DB");
  }

  if (cachedMe) {
    return res
      .status(200)
      .json(new ApiResponse(200, JSON.parse(cachedMe), "*All My Batches.*"));
  }

  const batch = await Teacher.findOne({ userId: user._id }).populate(
    "enrolledBatches",
    "name course teacher learningMode schedule monthlyFees",
  );

  if (!batch) {
    throw new ApiError(404, "Batch not found.");
  }

  try {
    await redisClient.setEx(
      cachedKey,
      60 * 20,
      JSON.stringify(batch.enrolledBatches),
    );
  } catch (err) {
    console.log("Redis set failed");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, batch.enrolledBatches, "All My Batches."));
});

// ***ASSIGN TEACHER TO BATCH*** \\

export const assignTeacherToBatch = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(401, "Authentication required.");
  }

  const { teacher_id } = req.params;
  const { batchName } = req.body;
  const { note } = req.body || undefined;

  if (!batchName) throw new ApiError(400, "Batch name is required.");

  const batch = await Batch.findOne({ name: batchName });
  if (!batch) {
    throw new ApiError(404, "Batch not found.");
  }

  const teacher = await Teacher.findById(teacher_id);
  if (!teacher) {
    throw new ApiError(404, "Teacher not found.");
  }

  // check not already assigned to this batch
  const alreadyAssigned = teacher.enrolledBatches.some(
    (id) => id.toString() === batch._id.toString(),
  );
  if (alreadyAssigned) {
    throw new ApiError(409, "Teacher is already assigned to this batch.");
  }

  // update both sides
  teacher.enrolledBatches.push(batch._id);
  await teacher.save({ validateBeforeSave: false });

  batch.teacher = teacher_id;
  await batch.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Teacher assigned to batch."));
});

// ***GET TEACHER BY ID*** \\

export const getTeacherById = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(401, "Authentication required.");
  }

  const { teacher_id } = req.params;

  const teacher = await Teacher.findById(teacher_id)
    .populate("userId", "name email")
    .populate("enrolledBatches", "name");

  if (!teacher) {
    throw new ApiError(404, "Teacher not found.");
  }

  let salary = await Salary.findOne({
    user: teacher.userId,
  });

  if (!salary) {
    // throw new ApiError(404, "Salary not found.");
    salary = undefined;
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { ...teacher.toObject(), salary }, "Teacher"));
});

// export const getTeacherBatches = asyncHandler(async (req, res) => {});

// export const getMyStudents = asyncHandler(async (req, res) => {
//   const user = req.user;

//   if (!user) {
//     throw new ApiError(404, "User not found.");
//   }

// });

// ***DELETE TEACHER*** \\

export const deleteTeacher = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(401, "Authentication required.");
  }

  if (user.role !== "super_admin") {
    throw new ApiError(403, "Only Super Admins can delete teachers.");
  }

  const { teacher_id } = req.params;

  const teacher = await Teacher.findById(teacher_id);

  if (!teacher) {
    throw new ApiError(404, "Teacher not found.");
  }

  const getUser = await User.findById(teacher.userId);
  if (!getUser) {
    throw new ApiError(404, "Associated user not found.");
  }
  await Teacher.findByIdAndDelete(teacher_id);
  await User.findByIdAndDelete(teacher.userId);

  return res.status(200).json(new ApiResponse(200, null, "Teacher deleted."));
});

// ***REMOVE TEACHER FROM BATCH*** \\

export const removeTeacherFromBatch = asyncHandler(async (req, res) => {
  const myUser = req.user;
  if (!myUser) {
    throw new ApiError(401, "Authentication required.");
  }

  const { teacher_id, batch_id } = req.params;

  const teacher = await Teacher.findById(teacher_id);
  if (!teacher) {
    throw new ApiError(404, "Teacher not found.");
  }

  const batch = await Batch.findById(batch_id);
  if (!batch) {
    throw new ApiError(404, "Batch not found.");
  }

  // check teacher is actually assigned to this batch
  if (!batch.teacher || batch.teacher.toString() !== teacher._id.toString()) {
    throw new ApiError(409, "Teacher is not assigned to this batch.");
  }

  batch.teacher = null;
  await batch.save({ validateBeforeSave: false });

  await Teacher.findByIdAndUpdate(teacher_id, {
    $pull: { enrolledBatches: batch._id },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, null, "Teacher removed from batch successfully."),
    );
});

export const getAllTeachers = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(404, "User not logged In.");
  }

  if (!["super_admin", "admin"].includes(user.role)) {
    throw new ApiError(
      401,
      "Only Super Admin or Admin can access All the teachers.",
    );
  }

  const teachers = await Teacher.find();

  return res
    .status(200)
    .json(new ApiResponse(200, teachers, "ALL THE TEACHERS."));
});
