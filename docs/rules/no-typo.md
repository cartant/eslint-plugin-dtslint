# `no-typo`

This rule forbids dtslint-style comments that have typographical errors that prevent them from being interpreted as actual dtslint-style comments.

## Rule details

Examples of **incorrect** code for this rule:

```ts
const a = "a"; // ExpectType string
const b: string = 0xb; // ExpectErr
const c = "c"; // ExpectDeprecation
const d = "d"; // ExpectNoDeprecation
```

Examples of **correct** code for this rule:

```ts
const a = "a"; // $ExpectType string
const b: string = 0xb; // $ExpectError
const c = "c"; // $ExpectDeprecation
const d = "d"; // $ExpectNoDeprecation
```