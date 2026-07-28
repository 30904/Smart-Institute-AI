const { loginWithEmailPassword, toMePayload } = require("../services/authService");
const { sendSuccess } = require("../utils/response");

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const data = await loginWithEmailPassword(email, password);
    sendSuccess(res, {
      data,
      message: "Login successful."
    });
  } catch (error) {
    next(error);
  }
}

async function me(req, res, next) {
  try {
    sendSuccess(res, {
      data: await toMePayload(req.user),
      message: "Authenticated user fetched."
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { login, me };
