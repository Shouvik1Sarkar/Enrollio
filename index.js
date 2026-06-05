import app from "./src/app.js";
import { PORT } from "./config/env.config.js";
import { MONGODB_URI } from "./config/env.config.js";
import { connectDB } from "./connection/db.connection.js";
import globalError from "./src/middleware/globalError.middleware.js";
import logger from "./src/utils/logger.utils.js";
import { connectRedis } from "./config/redis.config.js";

// if (process.env.NODE_ENV !== "test") {
//   await connectRedis();
// }
app.use(globalError);

// connectDB(MONGODB_URI).then(() => {
//   app.listen(PORT, () => {
//     logger.info({ PORT }, "Server running at->");
//   });
// });
const startServer = async () => {
  try {
    await connectDB(MONGODB_URI);

    if (process.env.NODE_ENV !== "test") {
      await connectRedis();
    }

    app.listen(PORT, () => {
      logger.info({ PORT }, "Server running at->");
    });
  } catch (err) {
    logger.error(err, "Server failed to start");
    process.exit(1);
  }
};

startServer();
