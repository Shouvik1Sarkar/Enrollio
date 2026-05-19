import { Router } from "express";

import { logInAuth } from "../middleware/logInAuth.middleware.js";

import { available_user_roles } from "../utils/constants.utils.js";
import authorizeRoles from "../middleware/authorizeRoles.middleware.js";
import {
  addFeeRecord,
  feeById,
  markEachFeePaid,
  markFeePaid,
} from "../controller/fees.controller.js";

const feesRouter = Router();

const admin = available_user_roles.ADMIN;
const super_admin = available_user_roles.SUPER_ADMIN;
const teacher = available_user_roles.TEACHER;
const student = available_user_roles.STUDENT;

feesRouter.post(
  "/:student_id/fees/add",
  logInAuth,
  authorizeRoles(admin, super_admin),
  addFeeRecord, // admin adds a pending fee for a month
);

feesRouter.get(
  "/:student_id/fees/:fee_id",
  logInAuth,
  authorizeRoles(admin, super_admin),
  feeById, // remove a wrong entry
);

feesRouter.patch(
  "/:student_id/pay",
  logInAuth,
  authorizeRoles(admin, super_admin),
  markFeePaid, // mark a specific fee record as paid
);

feesRouter.patch(
  "/:student_id/fees/:fee_id/pay",
  logInAuth,
  authorizeRoles(admin, super_admin),
  markEachFeePaid, // mark a specific fee record as paid
);

export default feesRouter;
