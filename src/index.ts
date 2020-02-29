import { PluginObj } from "@babel/core";
import * as t from "@babel/types";
import traverse from "@babel/traverse";

interface State {
  replacements?: any[];
}

function main(): PluginObj {
  return {
    name: "babel-plugin-linaria-theme",
    visitor: {
      TaggedTemplateExpression: {
        enter(path, state: State) {
          if (!t.isIdentifier(path.node.tag, { name: "css" })) return;

          const chunks: string[] = [];
          const expressions = path.node.quasi.expressions;
          state.replacements = [];

          path.node.quasi.quasis.forEach((quasi, index) => {
            if (quasi.value.raw !== ";") {
              chunks.push(quasi.value.raw);
            }
            // const exp = expressions.shift();
            const exp = expressions[index];

            if (t.isMemberExpression(exp)) {
              const id: (string | number)[] = [];
              traverse(
                exp,
                {
                  Identifier(path) {
                    id.push(path.node.name);
                  }
                },
                path.scope
              );

              traverse(
                exp,
                {
                  NumericLiteral(path) {
                    id.push(path.node.value);
                  }
                },
                path.scope
              );

              const cssPropRegex = /([a-z]+-?[a-z]+):[^;]+$/;
              const partialValueRegex = /: (.*) /;

              // grab the css property for this expression
              const properties = chunks[index].match(cssPropRegex);

              console.log(chunks[index]);
              const targetProperty = properties?.[properties.length - 1];

              // remove matched property from template literal
              chunks[index] = chunks[index].replace(cssPropRegex, "").trim();

              // grab partial values i.e. `1px solid `
              // if a partial value exists, we need to use a template literal for the object property value
              const partialVals = chunks[index].match(partialValueRegex);
              const partialVal = partialVals?.[1];
              const partials: (string | undefined)[] = [];
              partials[index] = partialVal;

              const members = membersFromArray(id.slice(2));

              const expression = t.callExpression(t.identifier("themed"), [
                t.arrowFunctionExpression(
                  [t.identifier("t")],
                  t.objectExpression([
                    t.objectProperty(t.identifier(targetProperty), members)
                  ])
                )
              ]);

              expressions[index] = expression;
              quasi.value.raw = chunks[index];
            }
          });
        }
      }
    }
  };
}

function membersFromArray(arr: (string | number)[]): t.MemberExpression {
  const items = [...arr];

  const last = items.pop();

  if (last) {
    const identifier =
      typeof last === "string" ? t.identifier(last) : t.numericLiteral(last);

    if (items.length === 0) {
      return t.memberExpression(t.identifier("t"), identifier);
    } else {
      return t.memberExpression(
        membersFromArray(items),
        identifier,
        typeof last === "number"
      );
    }
  } else {
    throw new Error("Something went wrong");
  }
}

export default main;
