const showDashboard = async (req, res) => {
  res.render("dashboard", { user: req.user });
};
module.exports = { showDashboard };
