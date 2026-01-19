const Otp = require("../model/otpModel");
const Login = require("../model/loginModel.js");
const bcrypt = require("bcryptjs");
const otpGenerator = require("otp-generator");
const sendOTPEmail = require("../utils/sendEmail");
const { registerPendingUser } = require("../services/userService");
const { body, validationResult } = require("express-validator");

require("dotenv").config("../.env");

const alphaErr = "must only contain letters.";
const lengthErr = "must be between 1 and 10 characters.";

const validateUser = [
  body("surname")
    .trim()
    .isAlpha()
    .withMessage(`Surname ${alphaErr}`)
    .isLength({ min: 2, max: 12 })
    .withMessage(`Surname ${lengthErr}`),
  body("lastname")
    .trim()
    .isAlpha()
    .withMessage(`Lastname ${alphaErr}`)
    .isLength({ min: 2, max: 12 })
    .withMessage(`Lastname ${lengthErr}`),
  body("email").isEmail().withMessage("Invalid email address"),
  body("password").isLength({ min: 2 }).withMessage("Password too short"),
];

const generateOtp = async (req, res) => {
  const errors = validationResult(req);
  const { email, surname, lastname, password } = req.body;

  let allErrors = errors.array();

  const otp = otpGenerator.generate(6, {
    digits: true,
    alphabets: false,
    upperCase: false,
    specialChars: false,
  });

  try {
    if (await Login.emailExists(email)) {
      allErrors.push({ msg: "Email already registered" });
    }

    if (allErrors.length > 0) {
      return showSignIn(req, res, [], allErrors);
    }

    await Otp.storeOtp(email, otp);
    await sendOTPEmail(email, otp);

    const hashedPassword = await bcrypt.hash(password, 10);

    req.session.pendingUser = {
      email,
      surname,
      lastname,
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
    return showSignIn(req, res, null, [
      { msg: "Session expired. Please register again." },
    ]);
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
    res.redirect("/");
  } catch (err) {
    console.error(err);

    res.render("otp", {
      user: req.user,
      errorMessage: "Error verifying OTP",
      message: "",
    });
  }
};

const showSignIn = async (req, res, next, errors = []) => {
  res.render("signIn", { errors, user: req.user });
};

module.exports = { generateOtp, verifyOtp, validateUser, showSignIn };
