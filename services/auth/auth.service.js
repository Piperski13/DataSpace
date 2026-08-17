const User = require("../../model/user.repository.js");
const Otp = require("../../model/otp.repository.js");
const ForgotPassword = require("../../model/forgotPassword.repository.js");
const otpGenerator = require("otp-generator");
const sendOTPEmail = require("../../utils/sendEmail.js");
const sendResetPasswordEmail = require("../../utils/resetPasswordEmail.js");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const ConflictError = require("../../errors/conflict.error.js");
const SessionExpiredError = require("../../errors/session.error.js");
const InvalidOtpError = require("../../errors/otp/invalid-otp.error.js");
const OtpExpiredError = require("../../errors/otp/otp-expired.error.js");
const NotFoundError = require("../../errors/not-found.error.js");

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

  static async requestPasswordReset({ email }) {
    const exists = await User.existsByEmail(email);

    if (!exists) {
      throw new ConflictError("Email non-existent");
    }

    const selector = crypto.randomBytes(8).toString("hex");
    const token = crypto.randomBytes(32).toString("hex");

    const hashedToken = await bcrypt.hash(token, 10);

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await ForgotPassword.create(email, selector, hashedToken, expiresAt);

    const resetLink = `${process.env.RESET_LINK_HOST}/auth/reset-password/${selector}/${token}`;

    await sendResetPasswordEmail(email, resetLink);
  }

  static async validatePasswordResetLink({ selector, token }) {
    const resetRecord = await ForgotPassword.findBySelector(selector);

    if (!resetRecord) {
      throw new NotFoundError("Invalid reset password link");
    }

    const tokenMatches = await bcrypt.compare(token, resetRecord.token);

    if (!tokenMatches) {
      throw new NotFoundError("Invalid reset password link");
    }

    if (new Date() > new Date(resetRecord.expires_at)) {
      throw new NotFoundError("Reset password link expired");
    }

    return resetRecord;
  }

  static async resetPassword({ selector, token, password }) {
    const resetEntry = await this.validatePasswordResetLink({
      selector,
      token,
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.updatePassword(hashedPassword, resetEntry.email);

    await ForgotPassword.removeBySelector(selector);
  }
}
module.exports = AuthService;
