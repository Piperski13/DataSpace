const AuthService = require("../services/auth/auth.service.js");
const asyncHandler = require("../middleware/errors/asyncHandler.js");

const AppError = require("../errors/app.error.js");

const passport = require("passport");
require("dotenv").config("../.env");

const showLogin = async (req, res) => {
  const successMessage = req.session.successMessage;
  delete req.session.successMessage;
  res.render("login-form", {
    appError: "",
    user: req.user,
    successMessage,
  });
};

const login = async (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      return res.render("login-form", {
        appError: info.message,
        user: null,
        successMessage: "",
      });
    }

    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.redirect("/workspaces/dashboard");
    });
  })(req, res, next);
};

const logout = asyncHandler(async (req, res) => {
  await new Promise((resolve, reject) => {
    req.logout((err) => {
      if (err) {
        return reject(err);
      }

      resolve();
    });
  });

  await new Promise((resolve, reject) => {
    req.session.destroy((err) => {
      if (err) {
        return reject(err);
      }

      resolve();
    });
  });

  return res.redirect("/auth/login");
});

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
      return res.render("register-form", {
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
  res.render("register-form", { fieldErrors: [], user: null, appError: "" });
};

const requestPasswordReset = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  try {
    await AuthService.requestPasswordReset({ email });

    return res.render("forgot-password-success");
  } catch (err) {
    if (err instanceof AppError) {
      return res.render("forgot-password-form", {
        user: req.user,
        appError: err.message,
      });
    }

    next(err);
  }
});

const showResetForm = asyncHandler(async (req, res) => {
  const selector = req.params.selector;
  const token = req.params.token;

  await AuthService.validatePasswordResetLink({ selector, token });

  return res.render("reset-password", {
    selector,
    token,
    fieldErrors: [],
    appError: "",
  });
});

const showForgotPage = async (req, res) => {
  return res.render("forgot-password-form", { appError: "" });
};

const handleResetPassword = asyncHandler(async (req, res) => {
  const { selector, token } = req.params;
  const { password } = req.body;

  await AuthService.resetPassword({
    selector,
    token,
    password,
  });

  req.session.successMessage = "Password changed successfully!";

  return res.redirect("/auth/login");
});

module.exports = {
  showLogin,
  login,
  logout,
  generateOtp,
  verifyOtp,
  showRegister,
  requestPasswordReset,
  showResetForm,
  showForgotPage,
  handleResetPassword,
};
