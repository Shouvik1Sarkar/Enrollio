import { Router } from "express";

import { logInAuth } from "../middleware/logInAuth.middleware.js";
import authorizeRoles from "../middleware/authorizeRoles.middleware.js";
import { available_user_roles } from "../utils/constants.utils.js";

const attendanceRouter = Router();

attendanceRouter.post("/first-user", createFirstUser);

export default attendanceRouter;
