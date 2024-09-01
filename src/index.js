const app = require('./app');
const db = require('./utils/db');
const logger = require('./utils/logger');

db();

const port = process.env.PORT || 5001;
app.listen(port, () => {
  /* eslint-disable no-console */
  logger.info(`Live at http://localhost:${port}`);
  /* eslint-enable no-console */
});
