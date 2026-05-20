// import { Router } from "express";

// import { logInAuth } from "../middleware/logInAuth.middleware.js";

// import { available_user_roles } from "../utils/constants.utils.js";
// import authorizeRoles from "../middleware/authorizeRoles.middleware.js";
// import {
//   addFeeRecord,
//   deleteFeeRecord,
//   feeById,
//   getStudentBalance,
//   getStudentFeeHistory,
//   markFeePaid,
// } from "../controller/fees.controller.js";

// const feesRouter = Router();

// const admin = available_user_roles.ADMIN;
// const super_admin = available_user_roles.SUPER_ADMIN;
// const teacher = available_user_roles.TEACHER;
// const student = available_user_roles.STUDENT;

// // FEES
// feesRouter.post(
//   "/:student_id/fees/add",
//   logInAuth,
//   authorizeRoles(admin, super_admin),
//   addFeeRecord, // admin adds a pending fee for a month
// );

// feesRouter.patch(
//   "/:student_id/fees/:fee_id/pay",
//   logInAuth,
//   authorizeRoles(admin, super_admin),
//   markFeePaid, // mark a specific fee record as paid
// );

// feesRouter.get(
//   "/:student_id/fees",
//   logInAuth,
//   authorizeRoles(admin, super_admin, teacher),
//   getStudentFeeHistory, // full fee history of one student
// );

// feesRouter.get(
//   "/:student_id/fees/balance",
//   logInAuth,
//   getStudentBalance, // total due vs paid vs balance
// );

// // feesRouter.patch(
// //   "/:student_id/fees/:fee_id",
// //   logInAuth,
// //   authorizeRoles(admin, super_admin),
// //   updateFeeRecord, // edit amount, note, dueDate of a specific record
// // );

// feesRouter.delete(
//   "/:student_id/fees/:fee_id",
//   logInAuth,
//   authorizeRoles(admin, super_admin),
//   deleteFeeRecord, // remove a wrong entry
// );

// feesRouter.get(
//   "/:student_id/fees/:fee_id",
//   logInAuth,
//   authorizeRoles(admin, super_admin),
//   feeById, // remove a wrong entry
// );

// export default feesRouter;
