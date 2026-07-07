const Login = require("../model/loginModel");

async function registerPendingUser(pendingUser) {
  if (!pendingUser) throw new Error("No pending user data");

  const { email, first_name, last_name, password } = pendingUser;
  await Login.addUser(email, password, first_name, last_name);
}

module.exports = { registerPendingUser };
