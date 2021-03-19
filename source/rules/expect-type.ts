/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/eslint-plugin-dtslint
 * Portions of this file are copyright (c) Microsoft Corporation - see THIRD_PARTY_NOTICES.
 */
/* eslint @typescript-eslint/array-type: 0, curly: 0 */

import {
  TSESLint as esLint,
  TSESTree as es,
} from "@typescript-eslint/experimental-utils";
import { getLoc, getParserServices } from "eslint-etc";
import * as ts from "typescript";
import { ruleCreator } from "../utils";

const rule = ruleCreator({
  defaultOptions: [],
  meta: {
    docs: {
      category: "Best Practices",
      description:
        "Asserts types with `$ExpectType` and presence of errors with `$ExpectError`.",
      recommended: false,
    },
    fixable: undefined,
    messages: {
      duplicateAssertion: "This line has two `$ExpectType` assertions.",
      expectedError: "Expected an error on this line, but found none.",
      expectedType: "Expected type to be: {{expected}}; got: {{actual}}.",
      missingNode: "Can not match a node to this assertion.",
    },
    schema: [],
    type: "problem",
  },
  name: "expect-type",
  create: (context) => {
    const { esTreeNodeToTSNodeMap, program } = getParserServices(context);
    return {
      Program: (node: es.Program) => {
        const sourceFile = esTreeNodeToTSNodeMap.get(node);
        walk(
          context.report,
          sourceFile.fileName,
          program,
          ts.version,
          undefined
        );
      },
    };
  },
});

export = rule;

function walk(
  report: (
    descriptor: esLint.ReportDescriptor<
      "duplicateAssertion" | "expectedError" | "expectedType" | "missingNode"
    >
  ) => void,
  fileName: string,
  program: ts.Program,
  versionName: string,
  nextHigherVersion: string | undefined
): void {
  const sourceFile = program.getSourceFile(fileName);
  if (!sourceFile) {
    throw new Error(`Source file ${fileName} not in program.`);
    // ctx.addFailure(
    //   0,
    //   0,
    //   `Program source files differ between TypeScript versions. This may be a dtslint bug.\n` +
    //     `Expected to find a file '${fileName}' present in ${ts.version}, but did not find it in ts@${versionName}.`
    // );
    // return;
  }

  const checker = program.getTypeChecker();
  // Don't care about emit errors.
  const diagnostics = ts.getPreEmitDiagnostics(program, sourceFile);
  // if (
  //   sourceFile.isDeclarationFile ||
  //   !/\$Expect(Type|Error)/.test(sourceFile.text)
  // ) {
  //   // Normal file.
  //   for (const diagnostic of diagnostics) {
  //     addDiagnosticFailure(diagnostic);
  //   }
  //   return;
  // }

  const { errorLines, typeAssertions, duplicates } = parseAssertions(
    sourceFile
  );

  for (const line of duplicates) {
    addFailureAtLine(line, "duplicateAssertion");
  }

  const seenDiagnosticsOnLine = new Set<number>();

  for (const diagnostic of diagnostics) {
    if (diagnostic.start != null) {
      const line = lineOfPosition(diagnostic.start, sourceFile);
      seenDiagnosticsOnLine.add(line);
    }
    // if (!errorLines.has(line)) {
    //   addDiagnosticFailure(diagnostic);
    // }
  }

  for (const line of errorLines) {
    if (!seenDiagnosticsOnLine.has(line)) {
      addFailureAtLine(line, "expectedError");
    }
  }

  const { unmetExpectations, unusedAssertions } = getExpectTypeFailures(
    sourceFile,
    typeAssertions,
    checker
  );
  for (const { node, expected, actual } of unmetExpectations) {
    report({
      data: { expected, actual },
      loc: getLoc(node),
      messageId: "expectedType",
    });
  }
  for (const line of unusedAssertions) {
    addFailureAtLine(line, "missingNode");
  }

  // function addDiagnosticFailure(diagnostic: ts.Diagnostic): void {
  //   const intro = getIntro();
  //   if (diagnostic.file === sourceFile) {
  //     const msg = `${intro}\n${ts.flattenDiagnosticMessageText(
  //       diagnostic.messageText,
  //       "\n"
  //     )}`;
  //     ctx.addFailureAt(diagnostic.start!, diagnostic.length!, msg);
  //   } else {
  //     ctx.addFailureAt(0, 0, `${intro}\n${fileName}${diagnostic.messageText}`);
  //   }
  // }

  // function getIntro(): string {
  //   if (nextHigherVersion === undefined) {
  //     return `TypeScript@${versionName} compile error: `;
  //   } else {
  //     const msg = `Compile error in typescript@${versionName} but not in typescript@${nextHigherVersion}.\n`;
  //     const explain =
  //       nextHigherVersion === "next"
  //         ? "TypeScript@next features not yet supported."
  //         : `Fix with a comment '// TypeScript Version: ${nextHigherVersion}' just under the header.`;
  //     return msg + explain;
  //   }
  // }

  function addFailureAtLine(
    line: number,
    messageId: "duplicateAssertion" | "expectedError" | "missingNode"
  ): void {
    if (!sourceFile) {
      return;
    }
    const startPosition = sourceFile.getPositionOfLineAndCharacter(line, 0);
    let endPosition = startPosition + sourceFile.text.split("\n")[line].length;
    if (sourceFile.text[endPosition - 1] === "\r") {
      endPosition--;
    }
    const start = ts.getLineAndCharacterOfPosition(sourceFile, startPosition);
    const end = ts.getLineAndCharacterOfPosition(sourceFile, endPosition);
    report({
      data: {},
      loc: {
        start: {
          line: start.line + 1,
          column: start.character,
        },
        end: {
          line: end.line + 1,
          column: end.character,
        },
      },
      messageId,
    });
  }
}

interface Assertions {
  /** Lines with an $ExpectError. */
  readonly errorLines: ReadonlySet<number>;
  /** Map from a line number to the expected type at that line. */
  readonly typeAssertions: Map<number, string>;
  /** Lines with more than one assertion (these are errors). */
  readonly duplicates: ReadonlyArray<number>;
}

function parseAssertions(sourceFile: ts.SourceFile): Assertions {
  const errorLines = new Set<number>();
  const typeAssertions = new Map<number, string>();
  const duplicates: number[] = [];

  const { text } = sourceFile;
  const commentRegexp = /\/\/(.*)/g;
  const lineStarts = sourceFile.getLineStarts();
  let curLine = 0;

  while (true) {
    const commentMatch = commentRegexp.exec(text);
    if (commentMatch === null) {
      break;
    }
    // Match on the contents of that comment so we do nothing in a commented-out assertion,
    // i.e. `// foo; // $ExpectType number`
    const match = /^ \$Expect((Type (.*))|Error)$/.exec(commentMatch[1]);
    if (match === null) {
      continue;
    }
    const line = getLine(commentMatch.index);
    if (match[1] === "Error") {
      if (errorLines.has(line)) {
        duplicates.push(line);
      }
      errorLines.add(line);
    } else {
      const expectedType = match[3];
      // Don't bother with the assertion if there are 2 assertions on 1 line. Just fail for the duplicate.
      if (typeAssertions.delete(line)) {
        duplicates.push(line);
      } else {
        typeAssertions.set(line, expectedType);
      }
    }
  }

  return { errorLines, typeAssertions, duplicates };

  function getLine(pos: number): number {
    // advance curLine to be the line preceding 'pos'
    while (lineStarts[curLine + 1] <= pos) {
      curLine++;
    }
    // If this is the first token on the line, it applies to the next line.
    // Otherwise, it applies to the text to the left of it.
    return isFirstOnLine(text, lineStarts[curLine], pos)
      ? curLine + 1
      : curLine;
  }
}

function isFirstOnLine(text: string, lineStart: number, pos: number): boolean {
  for (let i = lineStart; i < pos; i++) {
    if (text[i] !== " ") {
      return false;
    }
  }
  return true;
}

interface ExpectTypeFailures {
  /** Lines with an $ExpectType, but a different type was there. */
  readonly unmetExpectations: ReadonlyArray<{
    node: ts.Node;
    expected: string;
    actual: string;
  }>;
  /** Lines with an $ExpectType, but no node could be found. */
  readonly unusedAssertions: Iterable<number>;
}

function matchReadonlyArray(actual: string, expected: string) {
  if (!(/\breadonly\b/.test(actual) && /\bReadonlyArray\b/.test(expected)))
    return false;
  const readonlyArrayRegExp = /\bReadonlyArray</y;
  const readonlyModifierRegExp = /\breadonly /y;

  // A<ReadonlyArray<B<ReadonlyArray<C>>>>
  // A<readonly B<readonly C[]>[]>

  let expectedPos = 0;
  let actualPos = 0;
  let depth = 0;
  while (expectedPos < expected.length && actualPos < actual.length) {
    const expectedChar = expected.charAt(expectedPos);
    const actualChar = actual.charAt(actualPos);
    if (expectedChar === actualChar) {
      expectedPos++;
      actualPos++;
      continue;
    }

    // check for end of readonly array
    if (
      depth > 0 &&
      expectedChar === ">" &&
      actualChar === "[" &&
      actualPos < actual.length - 1 &&
      actual.charAt(actualPos + 1) === "]"
    ) {
      depth--;
      expectedPos++;
      actualPos += 2;
      continue;
    }

    // check for start of readonly array
    readonlyArrayRegExp.lastIndex = expectedPos;
    readonlyModifierRegExp.lastIndex = actualPos;
    if (
      readonlyArrayRegExp.test(expected) &&
      readonlyModifierRegExp.test(actual)
    ) {
      depth++;
      expectedPos += 14; // "ReadonlyArray<".length;
      actualPos += 9; // "readonly ".length;
      continue;
    }

    return false;
  }

  return true;
}

function getExpectTypeFailures(
  sourceFile: ts.SourceFile,
  typeAssertions: Map<number, string>,
  checker: ts.TypeChecker
): ExpectTypeFailures {
  const unmetExpectations: Array<{
    node: ts.Node;
    expected: string;
    actual: string;
  }> = [];
  // Match assertions to the first node that appears on the line they apply to.
  // `forEachChild` isn't available as a method in older TypeScript versions, so must use `ts.forEachChild` instead.
  ts.forEachChild(sourceFile, function iterate(node) {
    const line = lineOfPosition(node.getStart(sourceFile), sourceFile);
    const expected = typeAssertions.get(line);
    if (expected !== undefined) {
      // https://github.com/Microsoft/TypeScript/issues/14077
      if (node.kind === ts.SyntaxKind.ExpressionStatement) {
        node = (node as ts.ExpressionStatement).expression;
      }

      const type = checker.getTypeAtLocation(getNodeForExpectType(node));

      const actual = type
        ? checker.typeToString(
            type,
            /*enclosingDeclaration*/ undefined,
            ts.TypeFormatFlags.NoTruncation
          )
        : "";

      if (
        !expected
          .split(/\s*\|\|\s*/)
          .some((s) => actual === s || matchReadonlyArray(actual, s))
      ) {
        unmetExpectations.push({ node, expected, actual });
      }

      typeAssertions.delete(line);
    }

    ts.forEachChild(node, iterate);
  });
  return { unmetExpectations, unusedAssertions: typeAssertions.keys() };
}

function getNodeForExpectType(node: ts.Node): ts.Node {
  if (node.kind === ts.SyntaxKind.VariableStatement) {
    // ts2.0 doesn't have `isVariableStatement`
    const {
      declarationList: { declarations },
    } = node as ts.VariableStatement;
    if (declarations.length === 1) {
      const { initializer } = declarations[0];
      if (initializer) {
        return initializer;
      }
    }
  }
  return node;
}

function lineOfPosition(pos: number, sourceFile: ts.SourceFile): number {
  return sourceFile.getLineAndCharacterOfPosition(pos).line;
}
