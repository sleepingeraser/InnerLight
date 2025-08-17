module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["./jest.setup.js"],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/config/",
    "/models/",
    "/middleware/",
  ],
  testTimeout: 10000,
};
