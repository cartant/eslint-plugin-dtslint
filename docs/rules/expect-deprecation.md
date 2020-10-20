# expect-deprecation

This rule works with a dtslint-style `$ExpectDeprecation` comment.

## Rule details

`$ExpectDeprecation` and `$ExpectNoDeprecation` comments can be placed on lines to assert whether or not deprecated APIs are used:

```ts
deprecated(); // $ExpectDeprecation
nonDeprecated(); // $ExpectNoDeprecation
```