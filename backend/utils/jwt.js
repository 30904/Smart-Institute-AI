const jwt = require("jsonwebtoken");

function signJwt(payload) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return jwt.sign(payload, secret, {
    expiresIn: "1d"
  });
}

function verifyJwt(token) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return jwt.verify(token, secret);
}

module.exports = { signJwt, verifyJwt };
