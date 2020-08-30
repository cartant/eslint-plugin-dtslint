/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/eslint-plugin-dtslint
 */

import { tsquery } from "@phenomnomnominal/tsquery";
import { TSESTree as es } from "@typescript-eslint/experimental-utils";
import { getParserServices, getTypeServices } from "eslint-etc";
import * as ts from "typescript";
import { getDeprecation } from "../tslint-deprecation";
import { ruleCreator } from "../utils";

const rule = ruleCreator({
  defaultOptions: [],
  meta: {
    docs: {
      category: "Best Practices",
      description:
        "Asserts deprecations with `$ExpectDeprecation` and `$ExpectNoDeprecation`.",
      recommended: false,
    },
    fixable: undefined,
    messages: {
      found: "Deprecation found.",
      notFound: "Deprecation not found.",
    },
    schema: [],
    type: "problem",
  },
  name: "expect-deprecation",
  create: (context) => {
    const { esTreeNodeToTSNodeMap } = getParserServices(context);
    const { typeChecker } = getTypeServices(context);
    let expectations: Record<
      number,
      {
        expected: boolean;
        loc: es.SourceLocation;
      }
    > = {};

    function check(node: es.Node) {
      const { line } = node.loc.end;
      if (expectations.hasOwnProperty(line)) {
        const { expected, loc } = expectations[line];
        const idendtifers = tsquery(
          esTreeNodeToTSNodeMap.get(node),
          "Identifier"
        ) as ts.Identifier[];
        const found = idendtifers.some(
          (idendtifer) => getDeprecation(idendtifer, typeChecker) !== undefined
        );
        if (expected) {
          if (!found) {
            context.report({
              loc,
              messageId: "notFound",
            });
          }
        } else {
          if (found) {
            context.report({
              loc,
              messageId: "found",
            });
          }
        }
      }
    }

    return {
      ExpressionStatement: check,
      Program: (node: es.Program) => {
        const { comments } = node;
        if (!comments) {
          return;
        }
        expectations = comments.reduce((record, comment) => {
          const { value } = comment;
          const match = value.match(
            /(\s*)(\$ExpectDeprecation|\$ExpectNoDeprecation)/
          );
          if (match) {
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
            record[loc.start.line] = {
              expected: /^\$ExpectDeprecation/.test(expectation),
              loc,
            };
          }
          return record;
        }, {} as typeof expectations);
      },
      VariableDeclaration: check,
    };
  },
});

export = rule;
