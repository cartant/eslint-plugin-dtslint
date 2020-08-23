# eslint-plugin-dtslint

This repo contains ESLint versions of the dtslint rules in the [`tslint-etc`](https://github.com/cartant/tslint-etc) package. They're useful if you have an existing suite of dtslint tests. However, if you've not yet started writing tests for your TypeScript types, you should look at using [`tsd`](https://github.com/SamVerschueren/tsd) instead.

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
    "dtslint/expect-type": "error",
    "dtslint/no-typo": "error"
  }
};
```

# Rules

The package includes the following rules:

| Rule | Description | Recommended |
| --- | --- | --- |
| [`expect-deprecation`](https://github.com/cartant/eslint-plugin-dtslint/blob/main/source/rules/expect-deprecation.ts) | Asserts deprecations with `$ExpectDeprecation` and `$ExpectNoDeprecation`. | TBD |
| [`expect-type`](https://github.com/cartant/eslint-plugin-dtslint/blob/main/source/rules/expect-type.ts) | Asserts types with `$ExpectType` and presence of errors with `$ExpectError`. You can use ESLint and this rule to perform your type tests without having to install or run dtslint. | TBD |
| [`no-typo`](https://github.com/cartant/eslint-plugin-dtslint/blob/main/source/rules/no-typo.ts) | Forbids dtslint-like expectations that have typographical errors. | TBD |