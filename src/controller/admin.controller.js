import Admin from "../models/admin.models.js";
import User from "../models/user.models.js";
import ApiError from "../utils/ApiError.utils.js";
import ApiResponse from "../utils/ApiResponse.utils.js";
import asyncHandler from "../utils/asyncHandler.utils.js";

// *** SET UP ADMIN  *** \\

export const setUpAdmin = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(404, "User Not Logged In.");
  }

  if (!["super_admin", "admin"].includes(user.role)) {
    throw new ApiError(401, "Only Super Admin or Admin can set Up admin.");
  }

  const { salary } = req.body;
  const { userId } = req.params;

  const getAdminUser = await User.findById(userId);

  if (!getAdminUser) {
    throw new ApiError(404, "User not found.");
  }

  const admin = await Admin.create({
    userId: userId,
    createdBy: user._id,
    salary: salary ?? undefined,
  });

  if (!admin) {
    throw new ApiError(401, "Admin not created.");
  }

  return res.status(200).json(new ApiResponse(200, admin, "Admin Created."));
});

// *** SET UP ADMIN SALARY *** \\

export const setUpAdminSalary = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(404, "User Not Logged In.");
  }

  if (!["super_admin", "admin"].includes(user.role)) {
    throw new ApiError(401, "Only Super Admin or Admin can set Up admin.");
  }

  const { salary } = req.body;
  const { admin_id } = req.params;

  const getAdmin = await Admin.findById(admin_id);

  if (!getAdmin) {
    throw new ApiError(404, "Admin not found.");
  }

  getAdmin.salary = salary;

  await getAdmin.save();

  return res.status(200).json(new ApiResponse(200, getAdmin, "Admin Created."));
});

// *** ALL ADMINS *** \\

export const setUpAdminSalary = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(404, "User Not Logged In.");
  }

  if (!["super_admin", "admin"].includes(user.role)) {
    throw new ApiError(401, "Only Super Admin or Admin can access all admins.");
  }

  const allAdmins = await Admin.find();

  return res.status(200).json(new ApiResponse(200, allAdmins, "All Admins."));
});

// *** DELETE ADMIN *** \\

export const deleteAdmin = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(404, "User Not Logged In.");
  }

  if (!["super_admin"].includes(user.role)) {
    throw new ApiError(401, "Only Super Admin can delete admins.");
  }

  const { admin_id } = req.params;

  const admin = await Admin.findById(admin_id);

  if (!admin) {
    throw new ApiError(404, "Admin not found.");
  }

  await admin.deleteOne();

  return res.status(200).json(new ApiResponse(200, null, "Admin deleted."));
});

// *** GET ADMIN BY ID *** \\

export const getAdminById = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(404, "User Not Logged In.");
  }

  if (!["super_admin"].includes(user.role)) {
    throw new ApiError(401, "Only Super Admin can delete admins.");
  }

  const { admin_id } = req.params;

  const admin = await Admin.findById(admin_id);

  if (!admin) {
    throw new ApiError(404, "Admin not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, admin, "Admin found by id."));
});
