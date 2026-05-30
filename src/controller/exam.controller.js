import Batch from "../models/batch.models.js";
import Exam from "../models/exam.models.js";
import ApiError from "../utils/ApiError.utils.js";
import ApiResponse from "../utils/ApiResponse.utils.js";
import asyncHandler from "../utils/asyncHandler.utils.js";

export const createExam = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(401, "User not logged in");
  }

  const { batch, title, date, totalMarks, passingMarks } = req.body;
  const now = new Date();

  if (new Date(date) < now) {
    throw new ApiError(400, "Date must be in the future.");
  }

  const find_batch = await Batch.findOne({
    name: batch,
  });

  if (!find_batch) {
    throw new ApiError(404, "Batch not found");
  }

  const exists = await Exam.findOne({ batch: find_batch._id, title });
  if (exists)
    throw new ApiError(
      409,
      "Exam with this title already exists for this batch.",
    );

  const exam = await Exam.create({
    batch: find_batch._id,
    title,
    date,
    totalMarks,
    passingMarks,
    createdBy: user._id,
  });

  if (!exam) {
    throw new ApiError(500, "Exam not created.");
  }

  return res.status(201).json(new ApiResponse(201, exam, "Exam created."));
});

export const getExamById = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(401, "User not logged in");
  }

  const { exam_id } = req.params;

  const exam = await Exam.findById(exam_id)
    .populate("batch", "name course teacher")
    .populate("createdBy", "name userName email");

  if (!exam) {
    throw new ApiError(404, "Exam not found.");
  }

  return res.status(200).json(new ApiResponse(200, exam, "Exam details."));
});

export const updateExam = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(401, "User not logged in");
  }

  const { exam_id } = req.params;
  const exam = await Exam.findById(exam_id);
  if (!exam) {
    throw new ApiError(404, "Exam not found.");
  }
  const { title, date, totalMarks, passingMarks } = req.body;

  const existed_exam_title = await Exam.findOne({
    batch: exam.batch,
    title,
  });
  if (existed_exam_title) {
    throw new ApiError(409, "Exam title already exists");
  }

  const updateData = {};
  if (title) updateData.title = title;
  if (date) updateData.date = date;
  if (totalMarks) updateData.totalMarks = totalMarks;
  if (passingMarks) updateData.passingMarks = passingMarks;

  const updateExam = await Exam.findByIdAndUpdate(
    exam_id,
    {
      $set: updateData,
    },
    { new: true, runValidators: true },
  )
    .populate("batch", "name course teacher")
    .populate("createdBy", "name userName email");

  return res
    .status(200)
    .json(new ApiResponse(200, updateExam, "Exam data updated."));
});

export const deleteExam = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(401, "User not logged in");
  }

  const { exam_id } = req.params;

  const exam = await Exam.findById(exam_id);

  if (!exam) {
    throw new ApiError(404, "Exam not found.");
  }

  await exam.deleteOne();

  return res.status(200).json(new ApiResponse(200, null, "Exam deleted."));
});

export const getExamsByBatch = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(401, "User not logged in");
  }

  const { batch_id } = req.params;

  const batch = await Batch.findById(batch_id);

  if (!batch) {
    throw new ApiError(404, "Batch not found.");
  }

  const allExams = await Exam.find({
    batch: batch_id,
  });

  return res.status(200).json(new ApiResponse(200, allExams, "All Exams."));
});
