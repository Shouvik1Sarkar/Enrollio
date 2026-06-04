import { Router } from "express";
import {
  createFirstUser,
  createUser,
  forgotPassword,
  setForgetPassword,
  logInUser,
  logOutUser,
  sendEmailVerificationOTP,
  verifyEmail,
  changePassword,
  refreshToken,
} from "../controller/auth.controller.js";
import { logInAuth } from "../middleware/logInAuth.middleware.js";
import authorizeRoles from "../middleware/authorizeRoles.middleware.js";
import { available_user_roles } from "../utils/constants.utils.js";

const authRouter = Router();

// *** CREATE ATTENDANCE *** \\
authRouter.post("/first-user", createFirstUser);

// *** VERIFY EMAIL *** \\
authRouter.post("/verify", verifyEmail);

// *** SEND EMAIL VERIFICATION OTP *** \\
authRouter.post("/verification-token", sendEmailVerificationOTP);

// *** LOG IN USER *** \\
authRouter.post("/log-in", logInUser);

// *** CREATE USER *** \\
authRouter.post("/create-user", logInAuth, createUser);

// *** LOG OUT USER *** \\
authRouter.post("/log-out", logInAuth, logOutUser);

// *** FORGOT PASSWORD *** \\
authRouter.post("/forgot-password", forgotPassword);

// *** SET FORGET PASSWORD *** \\
authRouter.post("/set-forget-password", setForgetPassword);

// *** CHANGE PASSWORD *** \\
authRouter.post("/change-password", logInAuth, changePassword);

// *** REFRESH TOKEN *** \\
authRouter.post("/refresh-token", refreshToken);

export default authRouter;
