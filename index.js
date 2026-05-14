import app from "./src/app.js";
import { PORT } from "./config/env.config.js";
import { MONGODB_URI } from "./config/env.config.js";
import { connectDB } from "./connection/db.connection.js";
import globalError from "./src/middleware/globalError.middleware.js";
import logger from "./src/utils/logger.utils.js";

app.use(globalError);

connectDB(MONGODB_URI).then(() => {
  app.listen(PORT, () => {
    logger.info({ PORT }, "Server running at->");
  });
});
