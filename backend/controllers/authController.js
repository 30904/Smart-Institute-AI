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

function me(req, res) {
  sendSuccess(res, {
    data: toMePayload(req.user),
    message: "Authenticated user fetched."
  });
}

module.exports = { login, me };
