import traverse, { NodePath } from "@babel/traverse";
import * as t from "@babel/types";

export function buildObjectPath(
  neighbouringExpression: t.Expression,
  path: NodePath<t.TaggedTemplateExpression>
) {
  const objectPath: (string | number)[] = [];
  traverse(
    neighbouringExpression,
    {
      Identifier(path) {
        objectPath.push(path.node.name);
      }
    },
    path.scope
  );
  traverse(
    neighbouringExpression,
    {
      NumericLiteral(path) {
        objectPath.push(path.node.value);
      }
    },
    path.scope
  );
  return objectPath;
}
