const { loginWithEmailPassword, toMePayload } = require("../services/authService");

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const data = await loginWithEmailPassword(email, password);
    res.json({
      success: true,
      data,
      message: "Login successful."
    });
  } catch (error) {
    next(error);
  }
}

function me(req, res) {
  res.json({
    success: true,
    data: toMePayload(req.user),
    message: "Authenticated user fetched."
  });
}

module.exports = { login, me };
