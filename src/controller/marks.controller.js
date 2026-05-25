import Marks from "../models/marks.models.js";
import asyncHandler from "../utils/asyncHandler.utils.js";

export const createMarks = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(403, "User not logged In.");
  }

  const { exam_id } = req.params;

  const {
    student,
    teacher,
    batch,
    testName,
    testType,
    marksObtained,
    maxMarks,
    remarks,
  } = req.body;

  


  const marks = await Marks.create({});
});
