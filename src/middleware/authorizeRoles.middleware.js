// middleware/authorizeRoles.js

import ApiError from "../utils/ApiError.utils.js";

const authorizeRoles = (...roles) => {
  // console.log("--", roles);
  // console.log(roles.join(" or "));
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, `Access denied. Required: ${roles.join(" or ")}`);
    }
    next(); // role is allowed → continue to controller
  };
};

export default authorizeRoles;
