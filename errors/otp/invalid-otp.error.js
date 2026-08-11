const AppError = require("../app.error");
class InvalidOtpError extends AppError {
  constructor(message = "Invalid verification code") {
    super(message, 400);
    this.code = "INVALID_OTP";
  }
}

module.exports = InvalidOtpError;
