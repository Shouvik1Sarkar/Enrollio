import Batch from "../models/batch.models.js";
import Exam from "../models/exam.models.js";
import Marks from "../models/marks.models.js";
import Student from "../models/student.models.js";
import User from "../models/user.models.js";
import ApiError from "../utils/ApiError.utils.js";
import ApiResponse from "../utils/ApiResponse.utils.js";
import asyncHandler from "../utils/asyncHandler.utils.js";
import logger from "../utils/logger.utils.js";

export const createMarks = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(403, "User not logged In.");
  }

  const { exam_id, batch_id } = req.params;

  const exam = await Exam.findOne({
    _id: exam_id,
    batch: batch_id,
  });

  if (!exam) {
    throw new ApiError(400, "Exam not found.");
  }

  const batch = await Batch.findById(batch_id);

  if (!batch) {
    throw new ApiError(400, "Batch not found.");
  }

  const { user_name, testName, testType, marksObtained, maxMarks, remarks } =
    req.body;

  const find_user = await User.findOne({
    userName: user_name,
  });

  if (!find_user) {
    throw new ApiError(400, "User not found.");
  }

  const student = await Student.findOne({
    userId: find_user._id,
  });

  if (!student) {
    throw new ApiError(400, "Student not found.");
  }

  //   const exam = await Exam.findOne({
  //     title: testName,
  //   });

  const month = new Date();

  const marks = await Marks.create({
    batch: batch_id,
    testType,
    student: student._id,
    exam: exam_id,
    testName,
    marksObtained,
    maxMarks,
    remarks,
    month,
    teacher: user._id, // for now later from the batch
  });

  if (!marks) {
    throw new ApiError(400, "Marks not created.");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, marks, "Marks not created."));

  /**
   * if it's not super admin is the teacher the teacher of the batch (the exam of the batch)
   * if student is in the batch or not.
   * pass or fail (add the field in the schema and then based on marks.)
   * marks should be less than full marks
   *
   *
   */
});

export const updateMarks = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(403, "User not logged In.");
  }

  const { marks_id, student_id } = req.params;

  const { testType, marksObtained, maxMarks, remarks, month } = req.body;

  const marks = await Marks.findById(marks_id);

  if (!marks) {
    throw new ApiError(400, "Marks not found.");
  }
  // console.log("STUDENT: ", marks.student);
  // console.log("student_id: ", student_id);
  if (marks.student != student_id) {
    throw new ApiError(400, "Studet not matched");
  }

  if (testType) marks.testType = testType;
  if (marksObtained) marks.marksObtained = marksObtained;
  if (maxMarks) marks.maxMarks = maxMarks;
  if (remarks) marks.remarks = remarks;
  if (month) marks.month = month;

  await marks.save();
  return res.status(200).json(new ApiResponse(200, marks, "Marks Updated."));
});

export const deleteMarks = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(403, "User not logged In.");
  }

  const { marks_id } = req.params;

  const marks = await Marks.findById(marks_id);

  if (!marks) {
    throw new ApiError(400, "Marks not found.");
  }

  await marks.deleteOne();

  return res.status(200).json(new ApiResponse(200, null, "Marks deleted."));
});

export const getMarksByExam = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(403, "User not logged In.");
  }

  const { exam_id } = req.params;

  const marks = await Marks.find({
    exam: exam_id,
  })
    // .populate("exam", "batch title date totalMarks passingMarks")
    .populate({
      path: "student",
      select: "",
      populate: {
        path: "userId",
        model: "User",
        select: "name email", // whatever fields are on User
      },
    })
    .populate("exam", "batch title date totalMarks passingMarks")
    .populate("batch", "name course teacher");
  // .populate({
  //   path: "teacher",
  //   select: "",
  //   populate: {
  //     path: "userId",
  //     model: "User",
  //     select: "name email", // whatever fields are on User
  //   },
  // });

  if (!marks) {
    throw new ApiError(400, "Marks not found.");
  }

  return res.status(200).json(new ApiResponse(200, marks, "All Marks."));
});

export const getMarksByStudent = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(403, "User not logged In.");
  }

  const { student_id } = req.params;

  const marks = await Marks.find({
    student: student_id,
  });

  if (!marks) {
    throw new ApiError(400, "Marks not found.");
  }

  return res.status(200).json(new ApiResponse(200, marks, "All Marks."));
});

export const getMyMarks = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(403, "User not logged In.");
  }

  if (user.role !== "student") {
    throw new ApiError(400, "Only student can do this");
  }

  const marks = await Marks.find({
    student: user._id,
  });

  if (!marks) {
    throw new ApiError(400, "Marks not found.");
  }

  return res.status(200).json(new ApiResponse(200, marks, "My Marks."));
});

export const getMarksById = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(403, "User not logged In.");
  }

  const { marks_id } = req.params;

  const mark = await Marks.findById(marks_id)
    .populate({
      path: "student",
      select: "",
      populate: {
        path: "userId",
        model: "User",
        select: "name email", // whatever fields are on User
      },
    })
    .populate("exam", "batch title date totalMarks passingMarks")
    .populate("batch", "name course teacher");

  if (!mark) {
    throw new ApiError(400, "Marks not found.");
  }

  return res.status(200).json(new ApiResponse(200, mark, "My Marks."));
});
