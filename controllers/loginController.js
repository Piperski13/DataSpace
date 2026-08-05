const Otp = require("../model/otpModel");
const Login = require("../model/loginModel.js");
const bcrypt = require("bcryptjs");
const otpGenerator = require("otp-generator");
const sendOTPEmail = require("../utils/sendEmail");
const { registerPendingUser } = require("../services/userService");
const { body, validationResult } = require("express-validator");

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

const generateOtp = async (req, res) => {
  const { email, first_name, last_name, password } = req.body;

  const otp = otpGenerator.generate(6, {
    digits: true,
    alphabets: false,
    upperCase: false,
    specialChars: false,
  });

  try {
    await Login.emailExists(email);

    await Otp.storeOtp(email, otp);
    await sendOTPEmail(email, otp);

    const hashedPassword = await bcrypt.hash(password, 10);

    req.session.pendingUser = {
      email,
      first_name,
      last_name,
      password: hashedPassword,
    };

    res.render("otp", {
      user: req.user || "",
      message: "OTP sent to your email!",
      errorMessage: "",
    });
  } catch (err) {
    console.error(err);
    res.render("otp", { errorMessage: err });
  }
};

const verifyOtp = async (req, res) => {
  const { otp } = req.body;
  const otpString = otp.join("");
  const pendingUser = req.session.pendingUser;

  if (!pendingUser) {
    // return showSignIn(req, res, null, [
    //   { msg: "Session expired. Please register again." },
    // ]);
  }

  try {
    const { email } = pendingUser;
    const result = await Otp.verifyOtp(email, otpString);

    if (!result.valid) {
      const message =
        result.reason === "expired" ? "OTP expired" : "Invalid OTP";
      return res.render("otp", {
        user: req.user,
        errorMessage: message,
        message: "",
      });
    }

    await registerPendingUser(pendingUser);
    await Otp.removeOtp(email);

    delete req.session.pendingUser;

    req.session.successMessage = "✅ Account created successfully!";
    res.redirect("/auth/login");
  } catch (err) {
    console.error(err);

    res.render("otp", {
      user: req.user,
      errorMessage: "Error verifying OTP",
      message: "",
    });
  }
};

const showRegister = async (req, res, next, errors = []) => {
  res.render("signIn", { errors, user: null });
};

module.exports = {
  showLogin,
  login,
  logout,
  generateOtp,
  verifyOtp,
  showRegister,
};
