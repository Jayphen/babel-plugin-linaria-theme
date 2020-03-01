import traverse, { NodePath } from "@babel/traverse";
import * as t from "@babel/types";

export function objectPropertiesAsArray(
  neighbouringExpression: t.Expression,
  parentPath: NodePath<t.TaggedTemplateExpression>
) {
  let objectPath: (string | number)[] = [];

  traverse(
    neighbouringExpression,
    {
      MemberExpression(path) {
        objectPath = extractProperties(path);
        path.stop();
      }
    },
    parentPath.scope
  );
  return objectPath;
}

function extractProperties(path: NodePath<t.MemberExpression>) {
  const parent = path.parentPath.node;

  if (!t.isMemberExpression(parent)) return [];

  const properties = recursiveExtract(parent);

  return properties;
}

function recursiveExtract(expression: t.MemberExpression) {
  const properties: (string | number)[] = [];

  function ex(
    { property, object }: t.MemberExpression,
    props: (string | number)[]
  ) {
    if (t.isNumericLiteral(property)) {
      props.unshift(property.value);
    } else if (t.isIdentifier(property)) {
      props.unshift(property.name);
    }

    if (t.isMemberExpression(object)) {
      ex(object, properties);
    } else if (t.isIdentifier(object)) {
      properties.unshift(object.name);
    }
  }

  ex(expression, properties);

  return properties;
}
