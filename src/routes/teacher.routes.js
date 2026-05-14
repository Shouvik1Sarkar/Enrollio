import { Router } from "express";

import { logInAuth } from "../middleware/logInAuth.middleware.js";

const teacherRouter = Router();

// teacherRouter.post("/setup/:userId");

export default teacherRouter;
