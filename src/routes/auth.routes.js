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

authRouter.post("/first-user", createFirstUser);
authRouter.post("/verify", verifyEmail);
authRouter.post("/verification-token", sendEmailVerificationOTP);
authRouter.post("/log-in", logInUser);
authRouter.post("/create-user", logInAuth, createUser);
authRouter.post("/log-out", logInAuth, logOutUser);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/set-forget-password", setForgetPassword);
authRouter.post("/change-password", logInAuth, changePassword);
authRouter.post("/refresh-token", refreshToken);

export default authRouter;
