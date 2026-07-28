const dotenv = require("dotenv");

function loadEnv() {
  dotenv.config({ path: "../.env" });
}

module.exports = { loadEnv };
