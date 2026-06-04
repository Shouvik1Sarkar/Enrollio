import redisClient from "../../config/redis.config.js";
import Batch from "../models/batch.models.js";
import Course from "../models/courses.models.js";
import Student from "../models/student.models.js";
import User from "../models/user.models.js";
import ApiError from "../utils/ApiError.utils.js";
import ApiResponse from "../utils/ApiResponse.utils.js";
import asyncHandler from "../utils/asyncHandler.utils.js";
import {
  available_user_roles,
  learning_modes_enum,
} from "../utils/constants.utils.js";
import logger from "../utils/logger.utils.js";

export const createBatch = asyncHandler(async (req, res) => {
  const user = req.user;

  const myUser = await User.findById(user._id);

  if (!myUser) {
    throw new ApiError(401, "Authentication required.");
  }

  if (myUser.role === available_user_roles.STUDENT) {
    throw new ApiError(403, "Students cannot create batches.");
  }

  const {
    courseName,
    teacher,
    students,
    learningMode,
    schedule,
    monthlyFees,
    serial,
  } = req.body;

  if (!courseName) {
    throw new ApiError(400, "Course required.");
  }

  const course = await Course.findOne({
    name: courseName,
  });

  if (!course) {
    throw new ApiError(404, "Course not found.");
  }

  logger.info({ course }, "COURSE->");

  if (!learning_modes_enum.includes(learningMode.toUpperCase())) {
    throw new ApiError(400, "learning mode not available.");
  }

  const existedBatch = await Batch.findOne({
    courseName,
    serial,
  });

  if (existedBatch) {
    throw new ApiError(409, "Batch already exists.");
  }

  const batchName = `${courseName} Batch-${serial}`;

  const batch = await Batch.create({
    name: batchName,
    course: course._id,
    learningMode,
    schedule,
    createdBy: req.user._id,
    serial,
    monthlyFees: monthlyFees ?? undefined,
  });

  if (!batch) {
    throw new ApiError(500, "Failed to create batch.");
  }

  return res.status(201).json(new ApiResponse(201, batch, "COURSE CREATED."));
});

export const getAllBatches = asyncHandler(async (req, res) => {
  const myUser = req.user;

  if (!myUser) {
    throw new ApiError(401, "Authentication required.");
  }
  if (myUser.role !== available_user_roles.SUPER_ADMIN) {
    // console.log("MY USER->", myUser);

    throw new ApiError(403, "Insufficient permissions.");
  }

  const allBatches = await Batch.find().populate({
    path: "teacher",
    select: "education",
    populate: {
      path: "userId",
      model: "User",
      select: "name email", // whatever fields are on User
    },
  });

  return res.status(200).json(new ApiResponse(200, allBatches, "All batches."));
});

export const getBatchById = asyncHandler(async (req, res) => {
  const user = req.user;

  const myUser = await User.findById(user._id);

  if (!myUser) {
    throw new ApiError(401, "User not logged in.");
  }

  const { batch_id } = req.params;

  const batch = await Batch.findById(batch_id)
    .populate({
      path: "teacher",
      select: "education",
      populate: {
        path: "userId",
        model: "User",
        select: "name email", // whatever fields are on User
      },
    })
    .populate({
      path: "students",
      select: "userId studentType board standard",
      populate: {
        path: "userId",
        model: "User",
        select: "name email",
      },
    })
    .populate("course", "name")
    .populate("createdBy", "name userName role");

  if (!batch) {
    throw new ApiError(404, "Batch not found.");
  }

  return res.status(200).json(new ApiResponse(200, batch, "Batch found."));
});

export const updateBatch = asyncHandler(async (req, res) => {
  const user = req.user;

  const myUser = await User.findById(user._id);

  if (!myUser) {
    throw new ApiError(401, "User not logged in.");
  }

  if (myUser.role !== available_user_roles.SUPER_ADMIN) {
    throw new ApiError(403, "Only super admin can update batch");
  }

  const { batch_id } = req.params;

  const {
    courseName,
    teacher,

    learningMode,
    schedule,
    monthlyFees,
    serial,
  } = req.body;

  if (monthlyFees && monthlyFees <= 0) {
    throw new ApiError(400, "Monthly fees must be greater than 0");
  }

  // if someone sends an empty body, data = {} and you do a pointless DB call

  let data = {};

  // if (courseName) data.courseName = courseName;
  if (teacher) data.teacher = teacher;

  if (learningMode) data.learningMode = learningMode.toUpperCase();
  if (schedule) data.schedule = schedule;
  if (monthlyFees) data.monthlyFees = monthlyFees;
  if (serial) data.serial = serial;

  if (Object.keys(data).length === 0) {
    throw new ApiError(400, "No fields provided to update");
  }

  const updatedBatch = await Batch.findByIdAndUpdate(
    batch_id,
    {
      $set: data,
    },
    { new: true, runValidators: true },
  );

  if (!updatedBatch) {
    throw new ApiError(404, "Batch not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedBatch, "Batch Updated."));
});

export const deleteBatch = asyncHandler(async (req, res) => {
  const myUser = req.user;

  // console.log("USER->", user);
  // const myUser = await User.findById(user._id);
  // console.log("MY USER->", myUser);

  if (!myUser) {
    throw new ApiError(401, "User not logged in.");
  }

  if (myUser.role !== available_user_roles.SUPER_ADMIN) {
    throw new ApiError(403, "Only Super Admin can delete batches.");
  }
  const { batch_id } = req.params;
  const batch = await Batch.findById(batch_id);

  if (!batch) {
    throw new ApiError(404, "Batch not found");
  }

  await batch.deleteOne();

  return res.status(200).json(new ApiResponse(200, null, "deleted"));
});

export const removeStudent = asyncHandler(async (req, res) => {
  const myUser = req.user;

  // const myUser = await User.findById(user._id);

  if (!myUser) {
    throw new ApiError(401, "User not logged in.");
  }

  if (myUser.role === available_user_roles.STUDENT) {
    throw new ApiError(403, "Students cannot remove student.");
  }

  const { batch_id, student_id } = req.params;

  const student = await Student.findById(student_id);
  const batch = await Batch.findById(batch_id);

  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  if (!batch) {
    throw new ApiError(404, "Batch not found");
  }

  const isEnrolled = batch.students.some((id) => id.toString() === student_id);
  if (!isEnrolled) {
    throw new ApiError(400, "Student is not enrolled in this batch");
  }

  await Student.findByIdAndUpdate(student_id, {
    $pull: { enrolledBatches: batch_id },
    $inc: { total_fees: -batch.monthlyFees },
  });

  await Batch.findByIdAndUpdate(batch_id, {
    $pull: { students: student_id },
  });

  const updatedStudent = await Student.findById(student_id);

  updatedStudent.feeHistory = updatedStudent.feeHistory.filter(
    (record) => record.batch.toString() !== batch_id.toString(),
  );

  await updatedStudent.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(200, null, "Student removed from batch successfully"),
    );
});

export const allStudentsOfBatch = asyncHandler(async (req, res) => {
  const myUser = req.user;

  // const myUser = await User.findById(user._id);

  if (!myUser) {
    throw new ApiError(401, "User not logged in.");
  }

  if (myUser.role === available_user_roles.STUDENT) {
    throw new ApiError(
      403,
      "Students are not allowed to view all students of a batch.",
    );
  }

  const { batch_id } = req.params;

  const userId = req.user._id;
  const cachedKey = `all:students:${batch_id}`;
  let cachedMe;

  try {
    cachedMe = await redisClient.get(cachedKey);
  } catch (err) {
    console.log("Redis error, fallback to DB");
  }

  if (cachedMe) {
    return res
      .status(200)
      .json(new ApiResponse(200, JSON.parse(cachedMe), "*ALL STUDENTS.*"));
  }

  const batch = await Batch.findById(batch_id).populate({
    path: "students",
    select: "userId studentType board standard",
    populate: {
      path: "userId",
      model: "User",
      select: "name email",
    },
  });

  if (!batch) {
    throw new ApiError(404, "Batch not found");
  }

  try {
    await redisClient.setEx(cachedKey, 60 * 20, JSON.stringify(batch.students));
  } catch (err) {
    console.log("Redis set failed");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, batch.students, "STUDENTS."));
});
