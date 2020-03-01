import * as t from "@babel/types";

export function buildMembersFromArray(
  arr: (string | number)[]
): t.MemberExpression {
  const items = [...arr];

  const last = items.pop();

  if (last) {
    const identifier =
      typeof last === "string" ? t.identifier(last) : t.numericLiteral(last);

    if (items.length === 0) {
      return t.memberExpression(t.identifier("t"), identifier);
    } else {
      return t.memberExpression(
        buildMembersFromArray(items),
        identifier,
        typeof last === "number"
      );
    }
  } else {
    throw new Error("Something went wrong");
  }
}
