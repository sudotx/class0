import app from "./app.js";
import connectDB from "./utils/db.js";
import logger from "./utils/logger.js";

connectDB();

const port = process.env.PORT || 5001;
app.listen(port, () => {
  /* eslint-disable no-console */
  logger.info(`Live at http://localhost:${port}`);
  /* eslint-enable no-console */
});
