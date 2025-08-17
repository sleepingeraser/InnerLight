module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["./tests/setup.js"],
  coveragePathIgnorePatterns: ["/node_modules/", "/config/"],

  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js", "**/?(*.)+(spec|test).js"],
};
