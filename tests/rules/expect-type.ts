/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/eslint-plugin-dtslint
 */

import { stripIndent } from "common-tags";
import { fromFixture } from "eslint-etc";
import rule = require("../../source/rules/expect-type");
import { ruleTester } from "../utils";

ruleTester({ types: true }).run("expect-type", rule, {
  valid: [
    {
      code: stripIndent`
        const answer = 42; // $ExpectType 42
      `,
    },
    {
      code: stripIndent`
        const answer: boolean = 42; // $ExpectError
      `,
    },
  ],
  invalid: [
    fromFixture(stripIndent`
      const answer = 42; // $ExpectType boolean
      ~~~~~~~~~~~~~~~~~~ [expectedType { "expected": "boolean", "actual": "42" }]
    `),
    fromFixture(stripIndent`
      const answer: boolean = true; // $ExpectError
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ [expectedError]
    `),
  ],
});
