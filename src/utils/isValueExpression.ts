import * as t from "@babel/types";

/**
 * Checks if an expression is a 'value expression' - i.e. it appears as a CSS value.
 * We don't want to replace uses of ${theme.below.sm} {}
 */
export function isValueExpression(
  objectPath: (string | number)[],
  precedingQuasi: t.TemplateElement
): boolean {
  if (!objectPath.includes("theme")) return false;

  const quasiLines = precedingQuasi.value.raw.split("\n");
  const lastLine = quasiLines[quasiLines.length - 1];

  return lastLine.includes(":");
}
