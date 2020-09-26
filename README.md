# eslint-plugin-dtslint

[![GitHub License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/cartant/eslint-plugin-dtslint/blob/master/LICENSE)
[![NPM version](https://img.shields.io/npm/v/eslint-plugin-dtslint.svg)](https://www.npmjs.com/package/eslint-plugin-dtslint)
[![Downloads](http://img.shields.io/npm/dm/eslint-plugin-dtslint.svg)](https://npmjs.org/package/eslint-plugin-dtslint)
[![Build status](https://img.shields.io/circleci/build/github/cartant/eslint-plugin-dtslint?token=6d32b4f55e49a1cafa04ef1e81688005a05650d2)](https://app.circleci.com/pipelines/github/cartant)
[![dependency status](https://img.shields.io/david/cartant/eslint-plugin-dtslint.svg)](https://david-dm.org/cartant/eslint-plugin-dtslint)
[![devDependency Status](https://img.shields.io/david/dev/cartant/eslint-plugin-dtslint.svg)](https://david-dm.org/cartant/eslint-plugin-dtslint#info=devDependencies)
[![peerDependency Status](https://img.shields.io/david/peer/cartant/eslint-plugin-dtslint.svg)](https://david-dm.org/cartant/eslint-plugin-dtslint#info=peerDependencies)

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