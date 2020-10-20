# expect-type

This rule works with dtslint `$ExpectType` and `$ExpectError` comments.

## Rule details

`$ExpectType` or `$ExpectError` comments can be placed on lines to assert inferred types or errors:

```ts
const answer = 42; // $ExpectType number
const name: string = "alice"; // $ExpectError
```