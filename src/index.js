import { connect } from "mongoose";
import app from "./app.js";
import logger from "./utils/logger.js";

// connectDB();
try {
  const conn = await connect(process.env.MONGO_URI);
  logger.info(`MongoDB connected: ${conn.connection.host}`);
} catch (error) {
  logger.error(error);
  process.exit(1);
}

const port = process.env.PORT || 5001;
app.listen(port, () => {
  /* eslint-disable no-console */
  logger.info(`Live at http://localhost:${port}`);
  /* eslint-enable no-console */
});
