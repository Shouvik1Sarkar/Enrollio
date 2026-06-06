import { Router } from "express";

import { logInAuth } from "../middleware/logInAuth.middleware.js";
import {
  allUsers,
  deleteUser,
  getUser,
  getUserById,
  getUserByUserName,
  updateUser,
  updateUserRole,
} from "../controller/user.controller.js";
import { available_user_roles } from "../utils/constants.utils.js";
import authorizeRoles from "../middleware/authorizeRoles.middleware.js";

const userRouter = Router();

const admin = available_user_roles.ADMIN;
const super_admin = available_user_roles.SUPER_ADMIN;
const teacher = available_user_roles.TEACHER;
const student = available_user_roles.STUDENT;

// *** GET USER *** \\
userRouter.get(
  "/me",
  logInAuth,
  authorizeRoles(admin, super_admin, teacher),
  getUser,
);

// *** UPDATE USER *** \\
userRouter.patch(
  "/update",
  logInAuth,
  authorizeRoles(admin, super_admin, teacher),
  updateUser,
);

// *** ALL USERS *** \\
userRouter.get(
  "/all-users",
  logInAuth,
  authorizeRoles(admin, super_admin, teacher),
  allUsers,
);

// *** GET USER BY USER NAME*** \\
userRouter.post(
  "/username",
  logInAuth,
  authorizeRoles(admin, super_admin, teacher),
  getUserByUserName,
);

// *** DELETE USER *** \\
userRouter.delete(
  "/delete/:user_id",
  logInAuth,
  authorizeRoles(super_admin),
  deleteUser,
);

// *** UPDATE USER ROLE*** \\
userRouter.patch(
  "/role/:user_id",
  logInAuth,
  authorizeRoles(admin, super_admin, teacher),
  updateUserRole,
);

// *** GET USER BY ID *** \\
userRouter.get(
  "/:user_id",
  logInAuth,
  authorizeRoles(admin, super_admin),
  getUserById,
);

export default userRouter;
