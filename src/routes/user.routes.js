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

const userRouter = Router();

const admin = available_user_roles.ADMIN;
const super_admin = available_user_roles.SUPER_ADMIN;
const teacher = available_user_roles.TEACHER;
const student = available_user_roles.STUDENT;

userRouter.get(
  "/me",
  logInAuth,
  authorizeRoles(admin, super_admin, teacher),
  getUser,
);
userRouter.patch(
  "/update",
  logInAuth,
  authorizeRoles(admin, super_admin, teacher),
  updateUser,
);
userRouter.get(
  "/all-users",
  logInAuth,
  authorizeRoles(admin, super_admin, teacher),
  allUsers,
);
userRouter.get(
  "/username",
  logInAuth,
  authorizeRoles(admin, super_admin, teacher),
  getUserByUserName,
);
userRouter.delete(
  "/delete/:user_id",
  logInAuth,
  authorizeRoles(super_admin),
  deleteUser,
);
userRouter.patch(
  "/role/:user_id",
  logInAuth,
  authorizeRoles(admin, super_admin, teacher),
  updateUserRole,
);
userRouter.get(
  "/:user_id",
  logInAuth,
  authorizeRoles(admin, super_admin, teacher),
  getUserById,
);

export default userRouter;
