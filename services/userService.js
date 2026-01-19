const Login = require("../model/loginModel");

async function registerPendingUser(pendingUser) {
  if (!pendingUser) throw new Error("No pending user data");

  const { email, surname, lastname, password } = pendingUser;
  await Login.addUser(email, password, surname, lastname);
}

module.exports = { registerPendingUser };
