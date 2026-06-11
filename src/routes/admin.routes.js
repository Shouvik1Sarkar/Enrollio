import { Router } from "express";

import { logInAuth } from "../middleware/logInAuth.middleware.js";
import authorizeRoles from "../middleware/authorizeRoles.middleware.js";
import { available_user_roles } from "../utils/constants.utils.js";
import {
  deleteAdmin,
  getAdminById,
  setUpAdmin,
  setUpAdminSalary,
} from "../controller/admin.controller.js";

const authRouter = Router();

const admin = available_user_roles.ADMIN;
const super_admin = available_user_roles.SUPER_ADMIN;
const teacher = available_user_roles.TEACHER;
const student = available_user_roles.STUDENT;

// *** LOG OUT USER *** \\
authRouter.post(
  "/set-up/:userId",
  logInAuth,
  authorizeRoles(super_admin, admin),
  setUpAdmin,
);
authRouter.patch(
  "/set-salary/:admin_id",
  logInAuth,
  authorizeRoles(super_admin, admin),
  setUpAdminSalary,
);
authRouter.get(
  "/all",
  logInAuth,
  authorizeRoles(super_admin, admin),
  setUpAdminSalary,
);
authRouter.delete(
  "/:admin_id",
  logInAuth,
  authorizeRoles(super_admin),
  deleteAdmin,
);
authRouter.get(
  "/:admin_id",
  logInAuth,
  authorizeRoles(super_admin),
  getAdminById,
);

export default authRouter;
