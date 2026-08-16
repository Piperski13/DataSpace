const UserService = require("../services/user/user.service.js");
const asyncHandler = require("../middleware/errors/asyncHandler.js");

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await UserService.deleteUser(id);

  res.redirect("/users/");
});

const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { email, first_name, last_name } = req.body;
  const is_admin = req.body.is_admin === "true";

  await UserService.updateUser({
    id,
    email,
    first_name,
    last_name,
    is_admin,
  });

  res.redirect("/users/");
});
const showUsers = asyncHandler(async (req, res) => {
  const email = req.query.email || "";
  const profiles = await UserService.getUsers(email);

  res.render("user-list", { user: req.user, profiles, email });
});

const showUpdateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const profile = await UserService.getUserForEdit(id);

  res.render("user-form", {
    user: req.user,
    profile,
    fieldErrors: [],
  });
});

module.exports = {
  deleteUser,
  updateUser,
  showUsers,
  showUpdateUser,
};
