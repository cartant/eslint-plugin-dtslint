/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/eslint-plugin-dtslint
 */

import { TSESTree as es } from "@typescript-eslint/experimental-utils";
import { ruleCreator } from "../utils";

const rule = ruleCreator({
  defaultOptions: [],
  meta: {
    docs: {
      category: "Best Practices",
      description:
        "Forbids dtslint-like expectations that have typographical errors.",
      recommended: false,
    },
    fixable: undefined,
    messages: {
      typo: "Typo in dtslint expectation.",
    },
    schema: [],
    type: "problem",
  },
  name: "no-typo",
  create: (context) => {
    return {
      Program: (node: es.Program) => {
        const { comments } = node;
        if (!comments) {
          return;
        }
        comments.forEach((comment) => {
          if (comment.type !== "Line") {
            return;
          }

          const match = comment.value.match(/(\s*)(.+)$/);
          if (!match) {
            return;
          }
          const [, whitespace, expectation] = match;
          const commentTokenWidth = 2;
          const loc = {
            ...comment.loc,
            start: {
              ...comment.loc.start,
              column:
                comment.loc.start.column +
                commentTokenWidth +
                whitespace.length,
            },
          };

          if (/^(\$\s+)?Expect/.test(expectation)) {
            context.report({
              loc,
              messageId: "typo",
            });
            return;
          }
          if (!/^\$Expect/.test(expectation)) {
            return;
          }
          if (
            !/^\$Expect(Type\s*|Error\s*$|Deprecation\s*$|NoDeprecation\s*$)/.test(
              expectation
            )
          ) {
            context.report({
              loc,
              messageId: "typo",
            });
            return;
          }
          if (!/^\$ExpectType/.test(expectation)) {
            return;
          }
          if (!/^\$ExpectType\s+[^\s]/.test(expectation)) {
            context.report({
              loc,
              messageId: "typo",
            });
            return;
          }
        });
      },
    };
  },
});

export = rule;
