# eslint-plugin-dtslint

This repo is a WIP.

Eventually, it will contain ESLint versions of the dtslint rules in the [`tslint-etc`](https://github.com/cartant/tslint-etc) package.

# Install

Install the ESLint TypeScript parser using npm:

```
npm install @typescript-eslint/parser --save-dev
```

Install the package using npm:

```
npm install eslint-plugin-dtslint --save-dev
```

Configure the `parser` and the `parserOptions` for ESLint. Here, I use a `.eslintrc.js` file for the configuration:

```js
const { join } = require("path");
module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2019,
    project: join(__dirname, "./tsconfig.json"),
    sourceType: "module"
  },
  plugins: ["dtslint"],
  extends: [],
  rules: {
    "dtslint/expect-deprecation": "error",
    "dtslint/no-typo": "error"
  }
};
```

# Rules

The package includes the following rules:

| Rule | Description | Recommended |
| --- | --- | --- |
[`expect-deprecation`](https://github.com/cartant/eslint-plugin-dtslint/blob/master/source/rules/expect-deprecation.ts) | Asserts deprecations with `$ExpectDeprecation` and `$ExpectNoDeprecation`. | TBD |
[`no-typo`](https://github.com/cartant/eslint-plugin-dtslint/blob/master/source/rules/no-typo.ts) | Forbids dtslint-like expectations that have typographical errors. | TBD |