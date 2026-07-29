const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

function loadEnv() {
  const envPath = path.resolve(__dirname, "../.env");
  const envExamplePath = path.resolve(__dirname, "../.env.example");

  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    return;
  }

  dotenv.config({ path: envExamplePath });
}

module.exports = { loadEnv };
