import { Router } from "express";

import { logInAuth } from "../middleware/logInAuth.middleware.js";
import {
  allStudentsOfBatch,
  createBatch,
  deleteBatch,
  getAllBatches,
  getBatchById,
  removeStudent,
  updateBatch,
} from "../controller/batch.controller.js";

const batchRouter = Router();

// CREATE
batchRouter.post("/create", logInAuth, createBatch);

// READ
batchRouter.get("/all", logInAuth, getAllBatches); // with filters
batchRouter.get("/:batch_id", logInAuth, getBatchById); // single batch full details

// // UPDATE
batchRouter.patch("/:batch_id", logInAuth, updateBatch); // edit details
// batchRouter.patch("/:batch_id/toggle", logInAuth, toggleBatchStatus); // activate/deactivate

// // STUDENTS
// batchRouter.post("/:batch_id/enroll/:student_id", logInAuth, enrollStudent); // add student to batch
batchRouter.delete("/:batch_id/remove/:student_id", logInAuth, removeStudent); // remove student from batch
batchRouter.get("/all/:batch_id", logInAuth, allStudentsOfBatch); // remove student from batch

// // DELETE
batchRouter.delete("/:batch_id", logInAuth, deleteBatch);

export default batchRouter;
