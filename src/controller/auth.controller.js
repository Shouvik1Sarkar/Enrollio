import User from "../models/user.models.js";
import ApiError from "../utils/ApiError.utils.js";
import ApiResponse from "../utils/ApiResponse.utils.js";
import asyncHandler from "../utils/asyncHandler.utils.js";
import { available_user_roles } from "../utils/constants.utils.js";
import crypto from "crypto";
import {
  emailVerificationMailContent,
  forgotPasswordMailContent,
  sendMail,
} from "../utils/email.utils.js";
import jwt from "jsonwebtoken";

import logger from "../utils/logger.utils.js";
import { REFRESH_TOKEN_SECRET } from "../../config/env.config.js";

export const createFirstUser = asyncHandler(async (req, res) => {
  const { name, userName, email, password } = req.body;

  if (
    [name, userName, email, password].some(
      (e) => e === undefined || e.trim() === "",
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // only one super admin allowed
  // const superAdminExists = await User.findOne({
  //   role: available_user_roles.SUPER_ADMIN,
  // });

  // if (superAdminExists) {
  //   throw new ApiError(403, "Super admin already exists");
  // }

  const existedUser = await User.findOne({
    $or: [{ email }, { userName }],
  });

  if (existedUser) {
    throw new ApiError(409, "User already exists"); // 409 = conflict
  }

  const user = await User.create({
    name,
    userName,
    email,
    password,
    role: available_user_roles.SUPER_ADMIN,
  });

  if (!user) {
    throw new ApiError(500, "Something went wrong while creating the user");
  }

  const otp = user.generateOTP();
  await user.save({ validateBeforeSave: false });

  // logger.info({ otp }, "OTP->");
  logger.debug("OTP generated and emailed to user");

  logger.info({ otp }, "OTP->");

  await sendMail({
    email: user.email,
    subject: "Verify your account",
    mailGenContent: emailVerificationMailContent(user.name, otp),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -emailVerificationOtp -emailVerificationOtpExpiry",
  );

  return res
    .status(201)
    .json(
      new ApiResponse(201, createdUser, "Super admin created successfully"),
    );
});

export const sendEmailVerificationOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  if (user.isEmailVerified) {
    throw new ApiError(400, "Email is already verified");
  }

  const num = user.generateOTP();

  logger.info({ num }, "Num->");

  await user.save({ validateBeforeSave: false }); // save before sending

  await sendMail({
    email: user.email, // who to send to
    subject: "Verify your account", // email subject
    mailGenContent: emailVerificationMailContent(
      user.name, // passed to → "name: userName" in mailgen body
      num, // passed to → button link
    ),
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "OTP sent successfully"));
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { otp } = req.body;

  if (!otp) {
    throw new ApiError(400, "OTP required");
  }

  const encryptedOTP = crypto
    .createHash("sha256")
    .update(otp.toString())
    .digest("hex");

  const user = await User.findOne({
    $and: [
      { emailVerificationOtp: encryptedOTP },
      { emailVerificationOtpExpiry: { $gt: Date.now() } },
    ],
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  user.isEmailVerified = true;
  user.emailVerificationOtp = undefined;
  user.emailVerificationOtpExpiry = undefined;

  await user.save({ validateBeforeSave: false });

  const verifiedUser = await User.findById(user._id).select(
    "-password -emailVerificationOtp -emailVerificationOtpExpiry -refreshToken -forgotPasswordOtp -forgotPasswordOtpExpiry",
  );

  return res
    .status(200)
    .json(new ApiResponse(200, verifiedUser, "Email verified successfully"));
});

export const createUser = asyncHandler(async (req, res) => {
  const { name, userName, email, password, role } = req.body;

  // 1. validate inputs first
  if (
    [name, userName, email, password, role].some(
      (e) => e === undefined || e.trim() === "",
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // 2. check permissions
  const myUser = req.user; // already set by logInAuth

  if (myUser.role === available_user_roles.STUDENT) {
    throw new ApiError(403, "Students cannot create users");
  }

  // const isCreatingPrivilegedUser =
  //   role === available_user_roles.ADMIN ||
  //   role === available_user_roles.TEACHER;

  // if (
  //   isCreatingPrivilegedUser &&
  //   myUser.role !== available_user_roles.SUPER_ADMIN
  // ) {
  //   throw new ApiError(403, "Only super admin can create admins or teachers");
  // }

  if (myUser.role !== available_user_roles.SUPER_ADMIN) {
    if (role !== available_user_roles.STUDENT) {
      throw new ApiError(403, "Only Super Admin can create admin or teacher.");
    }
  }

  // 3. check duplicate
  const existedUser = await User.findOne({
    $or: [{ email }, { userName }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with this email or username already exists");
  }

  // 4. create user
  const createdUser = await User.create({
    name,
    userName,
    email,
    password,
    role,
    createdBy: myUser._id,
  });

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while creating the user");
  }

  // 5. generate and send OTP
  const otp = createdUser.generateOTP();
  await createdUser.save({ validateBeforeSave: false });

  logger.info({ otp }, "OTP->");

  await sendMail({
    email: createdUser.email,
    subject: "Verify your account",
    mailGenContent: emailVerificationMailContent(createdUser.name, otp),
  });

  // 6. return safe user object
  const finalUser = await User.findById(createdUser._id).select(
    "-password -emailVerificationOtp -emailVerificationOtpExpiry",
  );

  return res
    .status(201)
    .json(new ApiResponse(201, finalUser, "User created successfully"));
});

export const logInUser = asyncHandler(async (req, res) => {
  const { email, userName, password } = req.body;

  logger.debug({ email }, "This is email");

  if (!password) {
    throw new ApiError(400, "password is required.");
  }

  if (!email && !userName) {
    throw new ApiError(400, "Email or User is required.");
  }

  const user = await User.findOne({
    $or: [{ email }, { userName }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist.");
  }
  if (!user.isEmailVerified) {
    throw new ApiError(403, "Please verify your email before logging in");
  }
  const isPassword = await user.matchPassword(password);

  if (!isPassword) {
    throw new ApiError(401, "Password did not match");
  }
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  const encryptedRefreshToken = crypto
    .createHash("sha256")
    .update(refreshToken.toString())
    .digest("hex");

  await User.findByIdAndUpdate(user._id, {
    refreshToken: encryptedRefreshToken,
  });

  const userResult = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -forgotPasswordOtp",
  );

  // await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })
    .json(new ApiResponse(200, userResult, "Logged In."));
});

export const logOutUser = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Not logged in.");
  }

  await User.findByIdAndUpdate(req.user._id, { refreshToken: undefined });

  return res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse(200, null, "Logged Out"));
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email, userName } = req.body;

  const user = await User.findOne({
    $or: [{ email }, { userName }],
  });

  if (!user) {
    throw new ApiError(404, "No account found.");
  }

  const num = await user.generateForgotOTP();

  await user.save({ validateBeforeSave: false });

  await sendMail({
    email: user.email, // who to send to
    subject: "Verify your account", // email subject
    mailGenContent: forgotPasswordMailContent(
      user.name, // passed to → "name: userName" in mailgen body
      num, // passed to → button link
    ),
  });

  return res.status(200).json(new ApiResponse(200, null, "Otp Sent"));
});

export const setForgetPassword = asyncHandler(async (req, res) => {
  const { otp, newPassword, confirmNewPassword } = req.body;

  if (!otp) {
    throw new ApiError(400, "OTP is required.");
  }

  if (!newPassword || !confirmNewPassword) {
    throw new ApiError(400, "Passwords are required.");
  }

  if (newPassword !== confirmNewPassword) {
    throw new ApiError(400, "Passwords did not match.");
  }

  const hashed = crypto
    .createHash("sha256")
    .update(otp.toString())
    .digest("hex");

  const findUser = await User.findOne({
    $and: [
      { forgotPasswordOtp: hashed },
      {
        forgotPasswordOtpExpiry: {
          $gt: new Date(), // current date/time
        },
      },
    ],
  });

  if (!findUser) {
    throw new ApiError(404, "User not found.");
  }

  findUser.password = newPassword;
  findUser.forgotPasswordOtp = undefined;
  findUser.forgotPasswordOtpExpiry = undefined;

  await findUser.save();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Password updated successfully."));
});

export const changePassword = asyncHandler(async (req, res) => {
  const { password, newPassword, confirmNewPassword } = req.body;

  const user = req.user;
  if (!user) {
    throw new ApiError(400, "User not logged In.");
  }

  const userId = req.user?._id;

  const findUser = await User.findById(userId);

  if (!findUser) {
    throw new ApiError(404, "User not found.");
  }
  const isPassword = findUser.matchPassword(password);

  if (!isPassword) {
    throw new ApiError(401, "Password not matched");
  }

  if (!newPassword || !confirmNewPassword) {
    throw new ApiError(400, "Passwords are required.");
  }

  if (newPassword !== confirmNewPassword) {
    throw new ApiError(400, "Passwords did not match.");
  }

  findUser.password = newPassword;

  await findUser.save();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Password updated successfully."));
});

export const refreshToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "No refresh token provided");
  }

  // 1. verify JWT signature + expiry
  let decoded;
  try {
    decoded = jwt.verify(incomingRefreshToken, REFRESH_TOKEN_SECRET);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  // 2. hash the incoming token to compare with DB
  const hashedIncomingToken = crypto
    .createHash("sha256")
    .update(incomingRefreshToken)
    .digest("hex");

  // 3. find user and validate stored token matches
  const user = await User.findOne({
    _id: decoded._id,
    refreshToken: hashedIncomingToken,
  });

  if (!user) {
    throw new ApiError(401, "Refresh token is invalid or has been revoked");
  }

  // 4. generate new token pair (rotation)
  const newAccessToken = user.generateAccessToken();
  const newRefreshToken = user.generateRefreshToken();

  // 5. hash and store new refresh token
  const hashedNewRefreshToken = crypto
    .createHash("sha256")
    .update(newRefreshToken)
    .digest("hex");

  await User.findByIdAndUpdate(user._id, {
    refreshToken: hashedNewRefreshToken,
  });

  logger.info({ userId: user._id }, "Tokens rotated successfully");

  // 6. send new tokens
  return res
    .status(200)
    .cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })
    .cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })
    .json(new ApiResponse(200, null, "Tokens refreshed successfully"));
});
