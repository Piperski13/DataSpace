const User = require("../../model/user.repository.js");
const Otp = require("../../model/otp.repository.js");
const otpGenerator = require("otp-generator");
const sendOTPEmail = require("../../utils/sendEmail.js");
const bcrypt = require("bcryptjs");

const NotFoundError = require("../../errors/not-found.error.js");
const ConflictError = require("../../errors/conflict.error.js");

class AuthService {
  static async generateRegistrationOtp({
    email,
    first_name,
    last_name,
    password,
  }) {
    const exists = await User.existsByEmail(email);

    if (exists) {
      throw new ConflictError("Email is already registered");
    }

    const otp = otpGenerator.generate(6, {
      digits: true,
      alphabets: false,
      upperCase: false,
      specialChars: false,
    });

    const hashedPassword = await bcrypt.hash(password, 10);
    const pendingUser = {
      email,
      first_name,
      last_name,
      password: hashedPassword,
    };

    const hashedOtp = await bcrypt.hash(otp, 10);

    await Otp.create({
      email,
      otp: hashedOtp,
    });

    await sendOTPEmail(email, otp);

    return pendingUser;
  }
}
module.exports = AuthService;
