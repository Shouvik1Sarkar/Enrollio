import mongoose from "mongoose";
import logger from "../src/utils/logger.utils.js";

export const connectDB = async (url) => {
  try {
    await mongoose.connect(url);
    logger.info("MONGODB CONNECTION SUCCESSFUL.");
  } catch (error) {
    logger.error({ err: error }, "MONGODB CONNECTION FAILED.");
    // process.exit(1); // also add this
  }
};
