const AuthService = require("../services/auth/auth.service.js");
const asyncHandler = require("../middleware/errors/asyncHandler.js");

const User = require("../model/user.repository.js");
const ForgotPassword = require("../model/forgotPassword.repository.js");
const Otp = require("../model/otp.repository.js");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const sendOTPEmail = require("../utils/sendEmail.js");
const sendResetPasswordEmail = require("../utils/resetPasswordEmail.js");

const { registerPendingUser } = require("../services/userService.js");
const { body, validationResult } = require("express-validator");

const AppError = require("../errors/app.error.js");

const passport = require("passport");
require("dotenv").config("../.env");

const showLogin = async (req, res, next, error = []) => {
  const successMessage = req.session.successMessage;
  delete req.session.successMessage;
  res.render("login", {
    error,
    user: req.user,
    successMessage,
  });
};

const login = async (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      return showLogin(req, res, [], info.message);
    }

    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.redirect("/workspaces/dashboard");
    });
  })(req, res, next);
};

const logout = async (req, res, next) => {
  try {
    await new Promise((resolve, reject) => {
      req.logout((err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    req.session.destroy(() => {
      res.redirect("/auth/login");
    });
  } catch (err) {
    next(err);
  }
};

const generateOtp = asyncHandler(async (req, res) => {
  try {
    const { email, first_name, last_name, password } = req.body;

    const pendingUser = await AuthService.generateRegistrationOtp({
      email,
      first_name,
      last_name,
      password,
    });

    req.session.pendingUser = pendingUser;

    res.render("otp", {
      user: req.user,
      appError: "",
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.render("signIn", {
        user: req.user,
        appError: error.message,
        fieldErrors: [],
      });
    }
    next(err);
  }
});

const verifyOtp = asyncHandler(async (req, res) => {
  try {
    const otp = req.body.otp.join("");

    const pendingUser = req.session.pendingUser;

    await AuthService.completeRegistration({
      pendingUser,
      otp,
    });

    delete req.session.pendingUser;

    req.session.successMessage = "Account created successfully!";

    res.redirect("/auth/login");
  } catch (error) {
    if (error instanceof AppError) {
      return res.render("otp", {
        user: req.user,
        appError: error.message,
      });
    }
    next(err);
  }
});

const showRegister = async (req, res) => {
  res.render("signIn", { fieldErrors: [], user: null, appError: "" });
};

//forgotpass

const handleForgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const selector = crypto.randomBytes(8).toString("hex");
    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = await bcrypt.hash(token, 10);

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await ForgotPassword.addPasswordReset(
      email,
      selector,
      hashedToken,
      expiresAt,
    );

    const resetLink = `${process.env.RESET_LINK_HOST}/auth/reset-password/${selector}/${token}`;

    await sendResetPasswordEmail(email, resetLink);

    res.render("forgot-password-success");
  } catch (error) {
    console.error("Error handling forgot password:", error);

    res.status(500).json({ error: error.message });
  }
};

const showResetForm = async (req, res, next, fieldErrors = []) => {
  const selector = req.params.selector;
  const token = req.params.token;

  if (!selector || !token) {
    return res.render("reset-password", {
      fieldErrors: [{ msg: "Invalid reset link." }],
      selector: null,
      token: null,
    });
  }

  return res.render("reset-password", { selector, token, fieldErrors });
};

const showForgotPage = async (req, res) => {
  return res.render("forgot-password");
};

const handleResetPassword = async (req, res) => {
  const { selector, token } = req.params;
  const { password } = req.body;

  try {
    const resetEntry = await ForgotPassword.findBySelector(selector);
    if (!resetEntry || resetEntry.expires_at < new Date()) {
      return showResetForm(
        req,
        res,
        [],
        [{ msg: "Reset link invalid or expired." }],
      );
    }

    const tokenMatches = await bcrypt.compare(token, resetEntry.token_hash);

    if (!tokenMatches) {
      return showResetForm(req, res, [], [{ msg: "Invalid token." }]);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.updatePassword(hashedPassword, resetEntry.email);

    await ForgotPassword.removeBySelector(selector);

    req.session.successMessage = "✅ Password changed successfully!";
    res.redirect("/auth/login");
  } catch (error) {
    console.error("Error resetting password:", err);
    return showResetForm(
      req,
      res,
      [],
      [{ msg: "An unexpected error occurred. Please try again." }],
    );
  }
};

module.exports = {
  showLogin,
  login,
  logout,
  generateOtp,
  verifyOtp,
  showRegister,
  handleForgotPassword,
  showResetForm,
  showForgotPage,
  handleResetPassword,
};
