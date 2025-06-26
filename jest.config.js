const { createDefaultPreset } = require("ts-jest");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { defaults } = require('jest-config');

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  testPathIgnorePatterns: ["/e2e/", "/node_modules/"],
};
