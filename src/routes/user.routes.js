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

userRouter.get("/me", logInAuth, getUser);
userRouter.patch("/update", logInAuth, updateUser);
userRouter.get("/all-users", logInAuth, allUsers);
userRouter.get("/username", logInAuth, getUserByUserName);
userRouter.delete("/delete/:user_id", logInAuth, deleteUser);
userRouter.patch("/role/:user_id", logInAuth, updateUserRole);
userRouter.get("/:user_id", logInAuth, getUserById);

export default userRouter;
