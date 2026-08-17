function isAdmin(req, res, next) {
  if (!req.user || req.user.is_admin !== true) {
    return res.status(403).render("404");
  }

  next();
}

module.exports = isAdmin;
