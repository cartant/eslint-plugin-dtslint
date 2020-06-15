/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/eslint-plugin-dtslint
 */

import { stripIndent } from "common-tags";
import { fromFixture } from "eslint-etc";
import rule = require("../../source/rules/no-typo");
import { ruleTester } from "../utils";

ruleTester({ types: false }).run("no-typo", rule, {
  valid: [],
  invalid: [
    fromFixture(
      stripIndent`
        it("should detect missing $", () => {
          const a = "a"; // ExpectType string
                            ~~~~~~~~~~~~~~~~~ [typo]
          const b: string = 0xb; // ExpectError
                                    ~~~~~~~~~~~ [typo]
          const c = "c"; // ExpectDeprecation
                            ~~~~~~~~~~~~~~~~~ [typo]
          const d = "d"; // ExpectNoDeprecation
                            ~~~~~~~~~~~~~~~~~~~ [typo]
        });

        it("should detect mispelled expectations", () => {
          const a = "a"; // $ExpectTyp string
                            ~~~~~~~~~~~~~~~~~ [typo]
          const b: string = 0xb; // $ExpectErr
                                    ~~~~~~~~~~ [typo]
          const c = "c"; // $ExpectDeprcation
                            ~~~~~~~~~~~~~~~~~ [typo]
          const d = "d"; // $ExpectNoDeprcation
                            ~~~~~~~~~~~~~~~~~~~ [typo]
        });

        it("should detect spaces", () => {
          const a = "a"; // $Expect Type string
                            ~~~~~~~~~~~~~~~~~~~ [typo]
          const b: string = 0xb; // $Expect Error
                                    ~~~~~~~~~~~~~ [typo]
          const c = "c"; // $Expect Deprecation
                            ~~~~~~~~~~~~~~~~~~~ [typo]
          const d = "d"; // $Expect No Deprecation
                            ~~~~~~~~~~~~~~~~~~~~~~ [typo]
        });

        it("should detect a missing type", () => {
          const a = "a"; // $ExpectType
                            ~~~~~~~~~~~ [typo]
        });

        it("should detect type arguments without a type", () => {
          const a = "a"; // $ExpectType<string>
                            ~~~~~~~~~~~~~~~~~~~ [typo]
        });

        it("should not effect type-related false positives", () => {
          const a = "42"; // $ExpectType string
          const b: [string, number] = ["42", 42]; // $ExpectType [string, number]
          const c: (string | number)[] = ["42", 42]; // $ExpectType (string | number)[]
          interface T { answer: number };
          const t: T = { answer: 42 };  // $ExpectType T
        });
      `
    ),
  ],
});
