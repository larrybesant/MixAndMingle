module.exports = {
  extends: ["next/core-web-vitals"],
  rules: {
    // Disable rules that might be causing problems during development
    "react/no-unescaped-entities": "off",
    "@next/next/no-img-element": "off",
    "import/no-anonymous-default-export": "off",
    // Add more relaxed rules as needed
  },
  // Ignore specific files or directories if needed
  ignorePatterns: ["**/node_modules/**", ".next", "out"],
}
