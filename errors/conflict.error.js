const AppError = require("./app.error");

class ConflictError extends AppError {
  constructor(message) {
    super(message, 409);
  }
}

module.exports = ConflictError;
