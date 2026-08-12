const Users = require("../model/user.repository.js");
const View = require("../model/viewModel.js");

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const results = await Users.deleteById(id);

    if (results.rowCount === 0) {
      res.status(404).json({ message: `User with ${id} was not found ` });
    }
    res.redirect("/users/");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, first_name, last_name } = req.body;

    const is_admin = req.body.is_admin ? true : false;

    await Users.updateById({
      id,
      email,
      first_name,
      last_name,
      is_admin,
    });

    res.redirect("/users/");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const showUsers = async (req, res) => {
  const email = req.query.email || "";
  const data = await View.filterUsers(email);

  res.render("users", { user: req.user, data, email });
};

const showUpdateUser = async (req, res, next, fieldErrors = []) => {
  try {
    const { id } = req.params;
    let profile = null;

    if (id) {
      profile = await Users.findById(id);
    }

    res.render("updateUser", {
      user: req.user,
      profile,
      fieldErrors,
    });
  } catch (error) {
    console.error("Error in showUpdateUser:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  deleteUser,
  updateUser,
  showUsers,
  showUpdateUser,
};
