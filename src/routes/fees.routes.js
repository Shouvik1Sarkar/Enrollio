import { Router } from "express";

import { logInAuth } from "../middleware/logInAuth.middleware.js";

import { available_user_roles } from "../utils/constants.utils.js";
import authorizeRoles from "../middleware/authorizeRoles.middleware.js";

const feesRouter = Router();

const admin = available_user_roles.ADMIN;
const super_admin = available_user_roles.SUPER_ADMIN;
const teacher = available_user_roles.TEACHER;
const student = available_user_roles.STUDENT;
// admin only
// feesRouter.post(
//   "/structure/:student_id",
//   logInAuth,
//   authorizeRoles(admin, super_admin),
//   createFeeStructure,
// );
// feesRouter.patch(
//   "/structure/:student_id",
//   logInAuth,
//   authorizeRoles(ADMIN, SUPER_ADMIN),
//   updateFeeStructure,
// );
// feesRouter.post(
//   "/:student_id/pay",
//   logInAuth,
//   authorizeRoles(ADMIN, SUPER_ADMIN),
//   recordPayment,
// );
// feesRouter.delete(
//   "/:fee_id",
//   logInAuth,
//   authorizeRoles(ADMIN, SUPER_ADMIN),
//   deleteFeeRecord,
// );
// feesRouter.get(
//   "/dues",
//   logInAuth,
//   authorizeRoles(ADMIN, SUPER_ADMIN),
//   getAllDues,
// );
// feesRouter.get(
//   "/all",
//   logInAuth,
//   authorizeRoles(ADMIN, SUPER_ADMIN),
//   getAllPayments,
// );

// // student — own fees only
// feesRouter.get("/me", logInAuth, authorizeRoles(STUDENT), getMyFees);

// // shared
// feesRouter.get("/:student_id/history", logInAuth, getStudentFeeHistory);
// feesRouter.get("/:student_id/balance", logInAuth, getStudentBalance);

export default feesRouter;
