const app = require("./app");
const connectDB = require("./utils/db");
const logger = require("./utils/logger");

connectDB();

const port = process.env.PORT || 5001;
app.listen(port, () => {
  /* eslint-disable no-console */
  logger.info(`Live at http://localhost:${port}`);
  /* eslint-enable no-console */
});
