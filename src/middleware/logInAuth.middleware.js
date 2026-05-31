import cookieParser from "cookie-parser";

import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config/env.config.js";
import ApiError from "../utils/ApiError.utils.js";
import User from "../models/user.models.js";

export async function logInAuth(req, res, next) {
  const accessId = req.cookies.accessToken;

  if (!accessId) {
    throw new ApiError(401, "Not loggedIn cookie not here");
    // return next();
  }

  try {
    const decodedData = await jwt.verify(accessId, JWT_SECRET);
  } catch (err) {
    throw new ApiError(401, "Invalid or expired token.");
  }

  const user = await User.findById(decodedData._id);

  if (!user) {
    throw new ApiError(404, "Cookie sessioned out");
  }

  if (!user.isEmailVerified) {
    throw new ApiError(401, "Email not verified");
  }

  req.user = user;

  return next();
}
