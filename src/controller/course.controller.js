import Course from "../models/courses.models.js";
import ApiError from "../utils/ApiError.utils.js";
import ApiResponse from "../utils/ApiResponse.utils.js";
import asyncHandler from "../utils/asyncHandler.utils.js";
import { available_user_roles, boards_enum } from "../utils/constants.utils.js";
import User from "../models/user.models.js";

export const createCourse = asyncHandler(async (req, res) => {
  const user = req.user;

  const myUser = await User.findById(user._id);
  if (!myUser) {
    throw new ApiError(400, "User not logged in.");
  }

  if (myUser.role !== available_user_roles.SUPER_ADMIN) {
    throw new ApiError(403, "only super admin can create courses");
  }

  const { courseType, subject, standard, stream, board, description, name } =
    req.body;

  // if (!courseType) {
  //   throw new ApiError(400, "Course type is required");
  // }

  if (courseType === "professional" && !name) {
    throw new ApiError(400, "Name is required for professional courses");
  }

  if (courseType === "school" && (!subject || !standard || !board)) {
    throw new ApiError(
      400,
      "Subject, standard and board are required for school courses",
    );
  }

  if (!boards_enum.includes(board.toUpperCase())) {
    throw new ApiError(400, "BOARD DOES NOT EXIST");
  }

  const existingCourse = await Course.findOne({
    $or: [
      { subject, standard, board }, // school duplicate check
      { name: { $regex: new RegExp(`^${name}$`, "i") } }, // professional duplicate check
    ],
  });

  if (existingCourse) {
    throw new ApiError(409, "Course already exists");
  }

  const newCourse = await Course.create({
    name, // null for school — pre-save hook generates it
    courseType,
    subject,
    standard,
    stream,
    board,
    description: description ?? null,
    createdBy: myUser._id,
  });

  if (!newCourse) {
    throw new ApiError(500, "Something went wrong while creating the course");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, newCourse, "Course created successfully"));
});

export const deleteCourse = asyncHandler(async (req, res) => {
  const user = req.user;

  const myUser = await User.findById(user._id);

  if (!myUser) {
    throw new ApiError(400, "User not logged in.");
  }

  if (myUser.role !== available_user_roles.SUPER_ADMIN) {
    throw new ApiError(403, "Only super admin can delete a course");
  }

  const { course_id } = req.params;

  const existedCourse = await Course.findById(course_id);

  if (!existedCourse) {
    throw new ApiError(404, "Course not found");
  }

  await existedCourse.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Course deleted successfully"));
});

export const getAllCourses = asyncHandler(async (req, res) => {
  const user = req.user;

  const myUser = await User.findById(user._id);

  if (!myUser) {
    throw new ApiError(400, "User not logged in.");
  }

  if (myUser.role !== available_user_roles.SUPER_ADMIN) {
    throw new ApiError(403, "Only admin can see all the courses");
  }

  const allCourses = await Course.find();

  return res.status(200).json(new ApiResponse(200, allCourses, "All Courses."));
});

export const getCourseById = asyncHandler(async (req, res) => {
  const user = req.user;

  const myUser = await User.findById(user._id);

  if (!myUser) {
    throw new ApiError(400, "User not logged in.");
  }

  const { course_id } = req.params;

  const course = await Course.findById(course_id);

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  return res.status(200).json(new ApiResponse(200, course, "Course found."));
});

export const updateCourse = asyncHandler(async (req, res) => {
  const user = req.user;

  const myUser = await User.findById(user._id);

  if (!myUser) {
    throw new ApiError(400, "User not logged in.");
  }

  if (myUser.role !== available_user_roles.SUPER_ADMIN) {
    throw new ApiError(403, "Only super admin can update a course");
  }

  const { course_id } = req.params;
  const course = await Course.findById(course_id);
  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  const { courseType, subject, standard, stream, board, description, name } =
    req.body;

  if (!boards_enum.includes(board.toUpperCase())) {
    throw new ApiError(400, "BOARD DOES NOT EXIST");
  }

  const existingCourse = await Course.findOne({
    subject: subject || course.subject,
    standard: standard || course.standard,
    board: board || course.board,
    _id: { $ne: course_id },
  });

  if (existingCourse) {
    throw new ApiError(409, "Course already exists.");
  }

  const data = {};
  if (courseType) data.courseType = courseType;
  if (subject) data.subject = subject;
  if (standard) data.standard = standard;
  if (stream) data.stream = stream;
  if (board) data.board = board;
  if (description) data.description = description;
  if (name) data.name = name;

  const updateCourse = await Course.findByIdAndUpdate(
    course_id,
    { $set: data },
    { new: true },
  );

  if (!updateCourse) {
    throw new ApiError(409, "Course update failed.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updateCourse, "Course updated."));
});

// export const
