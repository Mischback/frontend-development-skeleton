module.exports = {
  env: {
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
  extends: ["eslint:recommended", "prettier"],
  ignorePatterns: ["build/*", "_util/bin/*"],
  rules: {},
  overrides: [
    {
      files: ["_src/ts/*"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: ["./tsconfig.production.json"],
      },
      extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "prettier",
      ],
    },
  ],
};
