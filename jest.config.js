module.exports = {
  testEnvironment: "node",
  clearMocks: true,
  coverageDirectory: "coverage",
  collectCoverageFrom: ["src/**/*.js", "!src/server.js"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
};
