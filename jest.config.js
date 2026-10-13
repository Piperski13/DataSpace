module.exports = {
  testEnvironment: "node",
  clearMocks: true,
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  verbose: true,
  testFailureExitCode: 1,
  errorOnDeprecated: true,
};
