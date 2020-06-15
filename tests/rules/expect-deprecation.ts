/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/eslint-plugin-dtslint
 */

import { stripIndent } from "common-tags";
import { fromFixture } from "eslint-etc";
import rule = require("../../source/rules/expect-deprecation");
import { ruleTester } from "../utils";

ruleTester({ types: true }).run("expect-deprecation", rule, {
  valid: [],
  invalid: [
    fromFixture(
      stripIndent`
        /** @deprecated */
        function deprecated(): number { return 42; }

        function undeprecated(): number { return 54; }

        function overloaded(value: false): boolean;
        /** @deprecated */
        function overloaded(value: true): boolean;
        function overloaded(value: boolean): boolean { return value; }

        it("should error on non-deprecated calls", () => {
          const result = undeprecated(); // $ExpectDeprecation
                                            ~~~~~~~~~~~~~~~~~~ [notFound]
          undeprecated(); // $ExpectDeprecation
                             ~~~~~~~~~~~~~~~~~~ [notFound]
        });

        it("should error on non-deprecated, overloaded calls", () => {
          const result = overloaded(false); // $ExpectDeprecation
                                               ~~~~~~~~~~~~~~~~~~ [notFound]
          overloaded(false); // $ExpectDeprecation
                                ~~~~~~~~~~~~~~~~~~ [notFound]
        });

        it("should not error on deprecated calls", () => {
          const result = deprecated(); // $ExpectDeprecation
          deprecated(); // $ExpectDeprecation
        });

        it("should not error on deprecated, overloaded calls", () => {
          const result = overloaded(true); // $ExpectDeprecation
          overloaded(true); // $ExpectDeprecation
        });

        it("should error on deprecated calls", () => {
          const result = deprecated(); // $ExpectNoDeprecation
                                          ~~~~~~~~~~~~~~~~~~~~ [found]
          deprecated(); // $ExpectNoDeprecation
                           ~~~~~~~~~~~~~~~~~~~~ [found]
        });

        it("should error on deprecated, overloaded calls", () => {
          const result = overloaded(true); // $ExpectNoDeprecation
                                              ~~~~~~~~~~~~~~~~~~~~ [found]
          overloaded(true); // $ExpectNoDeprecation
                               ~~~~~~~~~~~~~~~~~~~~ [found]
        });

        it("should not error on non-deprecated calls", () => {
          const result = undeprecated(); // $ExpectNoDeprecation
          undeprecated(); // $ExpectNoDeprecation
        });

        it("should not error on non-deprecated, overloaded calls", () => {
          const result = overloaded(false); // $ExpectNoDeprecation
          overloaded(false); // $ExpectNoDeprecation
        });
      `
    ),
  ],
});
