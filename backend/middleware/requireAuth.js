const User = require("../models/User");
const { verifyJwt } = require("../utils/jwt");

async function requireAuth(req, _res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      const err = new Error("Missing or invalid authorization header.");
      err.statusCode = 401;
      throw err;
    }

    const decoded = verifyJwt(token);
    const user = await User.findById(decoded.userId);

    if (!user || !user.is_active) {
      const err = new Error("Unauthorized.");
      err.statusCode = 401;
      throw err;
    }

    req.user = user;
    next();
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 401;
      error.message = "Unauthorized.";
    }
    next(error);
  }
}

module.exports = requireAuth;
