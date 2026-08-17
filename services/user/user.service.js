const User = require("../../model/user.repository.js");
const NotFoundError = require("../../errors/not-found.error.js");

class UserService {
  static async deleteUser(id) {
    const result = await User.deleteById(id);

    if (result.rowCount === 0) {
      throw new NotFoundError("User not found");
    }
  }
  static async updateUser({ id, email, first_name, last_name, is_admin }) {
    const user = await User.findById(id);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    await User.updateById({
      id,
      email,
      first_name,
      last_name,
      is_admin,
    });
  }
  static async getUsers(email) {
    return await User.findAll(email);
  }
  static async getUserForEdit(id) {
    const user = await User.findById(id);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  }
}
module.exports = UserService;
