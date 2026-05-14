import Teacher from "../models/teacher.models.js";
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

  const { education, experience, subjects } = req.body;

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
  });

  if (!teacher) {
    throw new ApiError(400, "TEACHER NOT CREATED.");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, student, "Teacher Created."));
});
