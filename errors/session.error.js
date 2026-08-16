const AppError = require("./app.error");

class SessionExpiredError extends AppError {
  constructor(
    message = "Registration session expired. Please register again.",
  ) {
    super(message, 400);
  }
}

module.exports = SessionExpiredError;
