// middleware/authorizeRoles.js

import ApiError from "../utils/ApiError.utils.js";

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, `Access denied. Required: ${roles.join(" or ")}`);
    }
    next(); // role is allowed → continue to controller
  };
};

export default authorizeRoles;
