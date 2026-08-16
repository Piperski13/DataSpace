const AppError = require("../app.error");
class OtpExpiredError extends AppError {
  constructor(message = "Your verification code expired") {
    super(message, 400);
    this.code = "OTP_EXPIRED";
  }
}

module.exports = OtpExpiredError;
