import Student from "../models/student.models.js";
import Teacher from "../models/teacher.models.js";
import User from "../models/user.models.js";
import ApiError from "../utils/ApiError.utils.js";
import ApiResponse from "../utils/ApiResponse.utils.js";
import asyncHandler from "../utils/asyncHandler.utils.js";
import {
  available_user_roles,
  user_roles_enum,
} from "../utils/constants.utils.js";

export const getUser = asyncHandler(async (req, res) => {
  const myUser = req.user;

  if (!myUser) {
    throw new ApiError(401, "User not logged in.");
  }

  // const userId = req.user._id;

  // const myUser = await User.findById(userId).select("-password -refreshToken");

  // if (!myUser) {
  //   throw new ApiError(401, "User not found");
  // }

  const response_data = { ...myUser.toObject() };

  // STUDENT

  if (myUser.role === available_user_roles.STUDENT) {
    const student = await Student.findOne({
      userId: myUser._id,
    })
      .select("-createdBy -__v")
      .populate("enrolledBatches", "name course");

    response_data.student_data = student;
  }

  return res
    .status(200)
    .json(new ApiResponse(200, response_data, "User Found."));
});

export const updateUser = asyncHandler(async (req, res) => {
  const myUser = req.user;
  if (!myUser) {
    throw new ApiError(401, "Not logged in.");
  }

  if (myUser.role === available_user_roles.STUDENT) {
    throw new ApiError(403, "Students cannot update accounts.");
  }

  const { email, userName, name } = req.body;

  if (!email && !userName && !name) {
    throw new ApiError(400, "At least one field is required to update.");
  }

  const updates = {};
  if (email) updates.email = email;
  if (userName) updates.userName = userName;
  if (name) updates.name = name;

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    { new: true, runValidators: true },
  ).select("-password -refreshToken");

  if (!updatedUser) {
    throw new ApiError(400, "Update failed.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "User updated successfully."));
});

// export const deleteUser = asyncHandler(async (req, res) => {
//   if (!req.user) {
//     throw new ApiError(401, "Not logged in.");
//   }

//   const userId = req.user?._id;

//   const myUser = await User.findById(userId).select("-password -refreshToken");

//   if (myUser.role !== available_user_roles.SUPER_ADMIN) {
//     throw new ApiError(401, null, "Only super admin can delete an account");
//   }

//   const { user_id } = req.params;

//   await User.findByIdAndDelete(user_id);

//   return res.status(200).json(new ApiResponse(200, null, "User deleted."));
// });

export const deleteUser = asyncHandler(async (req, res) => {
  const loggedInUser = req.user;

  // only super admin can delete users
  if (loggedInUser.role !== available_user_roles.SUPER_ADMIN) {
    throw new ApiError(403, "Only super admin can delete users");
  }

  const { user_id } = req.params;

  const user = await User.findById(user_id);
  if (!user) throw new ApiError(404, "User not found");

  // prevent super admin from deleting themselves
  if (user._id.toString() === loggedInUser._id.toString()) {
    throw new ApiError(400, "You cannot delete yourself");
  }

  // ── STUDENT cleanup ───────────────────────────
  if (user.role === available_user_roles.STUDENT) {
    const student = await Student.findOne({ userId: user_id });
    if (student) {
      // remove student from all their batches
      await Batch.updateMany(
        { _id: { $in: student.enrolledBatches } },
        { $pull: { students: student._id } },
      );
      await student.deleteOne();
    }
  }

  // ── TEACHER cleanup ───────────────────────────
  if (user.role === available_user_roles.TEACHER) {
    const teacher = await Teacher.findOne({ userId: user_id });
    if (teacher) {
      // batch survives but loses its teacher — admin assigns a new one
      await Batch.updateMany(
        { _id: { $in: teacher.enrolledBatches } },
        { $set: { teacher: null } },
      );
      await teacher.deleteOne();
    }
  }

  // ── ADMIN cleanup ─────────────────────────────
  if (user.role === available_user_roles.ADMIN) {
    await Admin.findOneAndDelete({ userId: user_id });
  }

  await user.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "User deleted successfully"));
});

export const allUsers = asyncHandler(async (req, res) => {
  const myUser = req.user;
  if (!myUser) {
    throw new ApiError(401, "Not logged in.");
  }

  // const userId = req.user?._id;

  // const myUser = await User.findById(userId).select("-password -refreshToken");

  // if (myUser.role !== available_user_roles.SUPER_ADMIN) {
  //   throw new ApiError(401, null, "Only super admin can delete an account");
  // }

  const allUsers = await User.find();

  // const responseData = await Promise.all(
  //   allUsers.map(async (user) => {
  //     const data = { ...user.toObject() };

  //     if (user.role === available_user_roles.STUDENT) {
  //       const student = await Student.findOne({ userId: user._id })
  //         .select("-createdBy -__v")
  //         .populate("enrolledBatches", "name course");

  //       data.studentProfile = student;
  //     }

  //     return data;
  //   }),
  // );

  return res.status(200).json(new ApiResponse(200, allUsers, "All Users."));
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const myUser = req.user;
  if (!myUser) {
    throw new ApiError(401, "Not logged in.");
  }

  // const userId = req.user?._id;

  // const myUser = await User.findById(userId).select("-password -refreshToken");

  // if (!myUser) {
  //   throw new ApiError(401, "User not found");
  // }

  if (myUser.role !== available_user_roles.SUPER_ADMIN) {
    throw new ApiError(403, "Only Super Admin can change User role.");
  }

  const { user_id } = req.params;

  if (user_id === userId.toString()) {
    throw new ApiError(400, "You cannot change your own role.");
  }

  const { role } = req.body;

  if (!role || !validRoles.includes(user_roles_enum)) {
    throw new ApiError(400, "Invalid role.");
  }

  const change_user = await User.findByIdAndUpdate(
    user_id,
    { $set: { role } },
    { new: true, runValidators: true },
  ).select("-password -refreshToken");

  if (!change_user) {
    throw new ApiError(404, "User not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, change_user, "ROLE updated."));
});

// Might change to only SUPER_ADMIN CAN DO THIS.

export const getUserById = asyncHandler(async (req, res) => {
  const myUser = req.user;
  if (!myUser) {
    throw new ApiError(401, "Not logged in.");
  }

  // const userId = req.user?._id;

  // const myUser = await User.findById(userId).select("-password -refreshToken");

  // if (!myUser) {
  //   throw new ApiError(401, "User not found");
  // }

  if (
    myUser.role === available_user_roles.STUDENT ||
    myUser.role === available_user_roles.TEACHER
  ) {
    throw new ApiError(403, "Students and teachers cannot update accounts.");
  }

  const { user_id } = req.params;

  if (!user_id) {
    throw new ApiError(400, "User Id is required.");
  }

  const user = await User.findById(user_id).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const response_data = { ...user.toObject() };

  // STUDENT

  if (user.role === available_user_roles.STUDENT) {
    const student = await Student.findOne({
      userId: user._id,
    })
      .select("-createdBy -__v")
      .populate("enrolledBatches", "name course");

    response_data.student_data = student;
  }

  return res
    .status(200)
    .json(new ApiResponse(200, response_data, "User found."));
});

// Might change to only SUPER_ADMIN CAN DO THIS.

export const getUserByUserName = asyncHandler(async (req, res) => {
  const myUser = req.user;
  if (!myUser) {
    throw new ApiError(401, "Not logged in.");
  }

  // const userId = req.user?._id;

  // const myUser = await User.findById(userId).select("-password -refreshToken");

  // if (!myUser) {
  //   throw new ApiError(401, "User not found");
  // }

  if (myUser.role === available_user_roles.STUDENT) {
    throw new ApiError(403, "Students cannot update accounts.");
  }

  const { user_name } = req.body;

  if (!user_name) {
    throw new ApiError(400, "User name is required.");
  }

  const user = await User.findOne({
    userName: user_name,
  }).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(new ApiResponse(200, user, "User found."));
});
