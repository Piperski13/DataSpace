const bcrypt = require("bcryptjs");
const User = require("../../model/user.repository");

async function createTestUser({
  email = "test-user@example.com",
  password = "test-password",
  first_name = "Test",
  last_name = "User",
} = {}) {
  const existingUser = await User.findByEmail(email);

  if (existingUser) {
    await User.deleteById(existingUser.id);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  return User.create({
    email,
    password: hashedPassword,
    first_name,
    last_name,
  });
}

module.exports = createTestUser;
