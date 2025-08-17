module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["./tests/setup.js"],
  testTimeout: 10000,
  coveragePathIgnorePatterns: ["/node_modules/", "/tests/"],
};
