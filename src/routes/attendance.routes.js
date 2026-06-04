import { Router } from "express";

import { logInAuth } from "../middleware/logInAuth.middleware.js";
import authorizeRoles from "../middleware/authorizeRoles.middleware.js";
import { available_user_roles } from "../utils/constants.utils.js";
import { createAttendance } from "../controller/attendance.controller.js";

const attendanceRouter = Router();

// *** CREATE ATTENDANCE *** \\
attendanceRouter.post("/", createAttendance);

export default attendanceRouter;
