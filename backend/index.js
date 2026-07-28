const { loadEnv } = require("./config/env");
const { connectDb } = require("./config/db");
const app = require("./app");
const { ensureDefaultAdmin } = require("./services/authService");
const { ensureDefaultInstitution } = require("./services/institutionService");

loadEnv();

const port = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDb();
    await ensureDefaultAdmin();
    await ensureDefaultInstitution();
    app.listen(port, () => {
      console.log(`Backend running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start backend:", error.message);
    process.exit(1);
  }
}

startServer();
