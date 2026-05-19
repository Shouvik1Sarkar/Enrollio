import Batch from "../models/batch.models.js";
import Student from "../models/student.models.js";
import User from "../models/user.models.js";
import ApiError from "../utils/ApiError.utils.js";
import ApiResponse from "../utils/ApiResponse.utils.js";
import asyncHandler from "../utils/asyncHandler.utils.js";
import { available_user_roles } from "../utils/constants.utils.js";

export const setupStudentProfile = asyncHandler(async (req, res) => {
  const user = req.user;

  const myUser = await User.findById(user._id);

  if (!myUser) {
    throw new ApiError(400, "User not logged in.");
  }

  if (myUser.role === available_user_roles.STUDENT) {
    throw new ApiError(403, "Student can not set up.");
  }

  const { studentType, board, standard, stream, createdBy } = req.body;

  const { userId } = req.params;

  const userStudent = await User.findById(userId);

  if (!userStudent) {
    throw new ApiError(400, "User not found.");
  }

  const student = await Student.create({
    userId,
    studentType,
    board,
    standard,
    stream,
    createdBy: req.user._id,
  });

  if (!student) {
    throw new ApiError(400, "STUDENT NOT CREATED.");
  }

  return res.status(201).json(new ApiResponse(201, student, "Student."));
});

export const getAllStudents = asyncHandler(async (req, res) => {
  const user = req.user;

  const myUser = await User.findById(user._id);

  if (!myUser) {
    throw new ApiError(400, "User not logged in.");
  }

  if (myUser.role === available_user_roles.STUDENT) {
    throw new ApiError(403, "Student can not set up.");
  }

  const all_students = await Student.find().populate(
    "userId",
    "name userName email isActive role avatar",
  );

  return res
    .status(200)
    .json(new ApiResponse(200, all_students, "All students."));
});

export const enrollStudentInBatch = asyncHandler(async (req, res) => {
  const myUser = req.user;

  if (myUser.role === available_user_roles.STUDENT) {
    throw new ApiError(403, "Students cannot enroll other students");
  }

  const { student_id } = req.params;
  const { batchName, note } = req.body;

  if (!batchName) {
    throw new ApiError(400, "Batch name is required");
  }

  const student = await Student.findById(student_id);
  if (!student) throw new ApiError(404, "Student not found");

  const batch = await Batch.findOne({ name: batchName });
  if (!batch) throw new ApiError(404, "Batch not found");

  // batch must be active
  // if (!batch.isActive) {
  //   throw new ApiError(400, "Cannot enroll in an inactive batch");
  // }

  // check capacity
  // if (batch.maxStudents && batch.students.length >= batch.maxStudents) {
  //   throw new ApiError(400, "Batch is full");
  // }

  // check not already enrolled

  const isAlreadyEnrolled = student.enrolledBatches.some(
    (id) => id.toString() === batch._id.toString(),
  );

  if (isAlreadyEnrolled) {
    throw new ApiError(400, "Student is already enrolled in this batch");
  }

  // update both sides cleanly
  await Student.findByIdAndUpdate(student_id, {
    $push: { enrolledBatches: batch._id },
    $inc: { total_fees: batch.monthlyFees },
  });

  await Batch.findByIdAndUpdate(batch._id, { $push: { students: student_id } });

  const now = new Date();

  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const dueDate = new Date(now.getFullYear(), now.getMonth(), 10);

  student.feeHistory.push({
    batch: batch._id,
    amount: batch.monthlyFees,
    month,
    dueDate,
    status: "pending",
    note: note ?? null,
  });

  await student.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Student enrolled successfully"));
});

export const getStudentById = asyncHandler(async (req, res) => {
  const user = req.user;

  const myUser = await User.findById(user._id);

  if (!myUser) {
    throw new ApiError(400, "User not logged in.");
  }

  if (myUser.role === available_user_roles.STUDENT) {
    throw new ApiError(403, "Student can not see student by Id.");
  }
  const { student_id } = req.params;

  const student = await Student.findById(student_id)
    .populate("userId", "name userName email isActive role avatar")
    .populate("enrolledBatches", "name course teacher learningMode");

  if (!student) {
    throw new ApiError(400, "Student not found.");
  }

  return res.status(200).json(new ApiResponse(200, student, "Student."));
});

export const updateStudentProfile = asyncHandler(async (req, res) => {
  const user = req.user;

  const myUser = await User.findById(user._id);

  if (!myUser) {
    throw new ApiError(400, "User not logged in.");
  }

  if (myUser.role === available_user_roles.STUDENT) {
    throw new ApiError(403, "Student can not set up.");
  }

  const { studentType, board, standard, stream } = req.body;

  const data = {};
  if (studentType) data.studentType = studentType;
  if (board) data.board = board;
  if (standard) data.standard = standard;
  if (stream) data.stream = stream;

  const { student_id } = req.params;

  const student = await Student.findById(student_id);

  if (!student) {
    throw new ApiError(400, "Student not found");
  }

  const updated_student = await Student.findByIdAndUpdate(
    student_id,
    {
      $set: data,
    },
    {
      new: true,
      runValidators: true,
    },
  ).populate("userId", "name userName email isActive role avatar");

  if (!updated_student) {
    throw new ApiError(403, "failed to update.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updated_student, "Students updated."));
});

export const removeStudentFromBatch = asyncHandler(async (req, res) => {
  const user = req.user;
  const myUser = await User.findById(user._id);

  if (myUser.role === available_user_roles.STUDENT) {
    throw new ApiError(
      403,
      "Students cannot remove other students from batches",
    );
  }

  const { student_id, batch_id } = req.params;

  const student = await Student.findById(student_id);
  if (!student) throw new ApiError(404, "Student not found");

  const batch = await Batch.findById(batch_id);
  if (!batch) throw new ApiError(404, "Batch not found");

  // check student is actually in this batch
  const isEnrolled = batch.students.some((id) => id.toString() === student_id);
  if (!isEnrolled) {
    throw new ApiError(400, "Student is not enrolled in this batch");
  }

  // check for unpaid fees
  // const pendingFees = await Fees.findOne({
  //   student: student_id,
  //   batch: batch_id,
  //   status: "pending",
  // });
  // if (pendingFees) {
  //   throw new ApiError(400, "Student has pending fees in this batch");
  // }

  // $pull handles ObjectId comparison correctly
  await Student.findByIdAndUpdate(student_id, {
    $pull: { enrolledBatches: batch_id },
  });

  await Batch.findByIdAndUpdate(batch_id, { $pull: { students: student_id } });

  return res
    .status(200)
    .json(
      new ApiResponse(200, null, "Student removed from batch successfully"),
    );
});
