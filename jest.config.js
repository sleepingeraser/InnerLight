module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["./tests/testSetup.js"],
  globalSetup: "./tests/setup.js",
  globalTeardown: "./tests/teardown.js",
  coveragePathIgnorePatterns: ["/node_modules/", "/tests/", "/config/"],
  testTimeout: 30000,
};
