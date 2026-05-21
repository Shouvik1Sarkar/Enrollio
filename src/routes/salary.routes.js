import { Router } from "express";

import { logInAuth } from "../middleware/logInAuth.middleware.js";

import { available_user_roles } from "../utils/constants.utils.js";
import authorizeRoles from "../middleware/authorizeRoles.middleware.js";
import {
  paid_salary,
  salary_history,
  set_salary,
} from "../controller/salary.controller.js";

const salaryRouter = Router();

const admin = available_user_roles.ADMIN;
const super_admin = available_user_roles.SUPER_ADMIN;
const teacher = available_user_roles.TEACHER;
const student = available_user_roles.STUDENT;

salaryRouter.post(
  "/create-salary/:user_id",
  logInAuth,
  authorizeRoles(admin, super_admin),
  set_salary,
);
salaryRouter.post(
  "/paid/:user_id",
  logInAuth,
  authorizeRoles(admin, super_admin),
  paid_salary,
);
salaryRouter.get(
  "/paid/:user_id",
  logInAuth,
  authorizeRoles(admin, super_admin),
  salary_history,
);

export default salaryRouter;
