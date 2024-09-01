const app = require("./app");
const db = require("./utils/db");
db();

const port = process.env.PORT || 5001;
app.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`Live at http://localhost:${port}`);
  /* eslint-enable no-console */
});
