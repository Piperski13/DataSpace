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
      res.redirect("/auth");
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { showLogin, login, logout };
