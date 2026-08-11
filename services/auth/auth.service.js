const User = require("../../model/user.repository.js");
const Otp = require("../../model/otp.repository.js");
const otpGenerator = require("otp-generator");
const sendOTPEmail = require("../../utils/sendEmail.js");
const bcrypt = require("bcryptjs");

const ConflictError = require("../../errors/conflict.error.js");
const SessionExpiredError = require("../../errors/session.error.js");
const InvalidOtpError = require("../../errors/otp/invalid-otp.error.js");
const OtpExpiredError = require("../../errors/otp/otp-expired.error.js");

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
  static async completeRegistration({ pendingUser, otp }) {
    if (!pendingUser) {
      throw new SessionExpiredError();
    }

    const { email } = pendingUser;

    const otpRecord = await Otp.findLatestByEmail(email);

    if (!otpRecord) {
      throw new InvalidOtpError();
    }

    const isMatch = await bcrypt.compare(otp, otpRecord.otp);

    if (!isMatch) {
      throw new InvalidOtpError();
    }

    const ageInMinutes =
      (Date.now() - otpRecord.created_at.getTime()) / 1000 / 60;

    if (ageInMinutes > 5) {
      throw new OtpExpiredError();
    }

    await User.create(pendingUser);
    await Otp.remove(email);
  }
}
module.exports = AuthService;
