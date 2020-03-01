import { PluginObj } from "@babel/core";
import * as t from "@babel/types";
import {
  isValueExpression,
  buildMembersFromArray,
  objectPropertiesAsArray
} from "./utils";

function main(): PluginObj {
  return {
    name: "babel-plugin-linaria-theme",
    visitor: {
      TaggedTemplateExpression: {
        enter(path) {
          if (!t.isIdentifier(path.node.tag, { name: "css" })) return;

          const chunks: string[] = [];
          const expressions = path.node.quasi.expressions;

          path.node.quasi.quasis.forEach((quasi, index) => {
            if (!quasi.tail) {
              chunks.push(quasi.value.raw);
            }

            const neighbouringExpression = expressions[index];
            const objectProperties = objectPropertiesAsArray(
              neighbouringExpression,
              path
            );

            if (isValueExpression(objectProperties, quasi)) {
              const cssPropRegex = /([a-z]+-?[a-z]+):[^;]+$/;
              const partialValueRegex = /: (.*) /;

              // grab the css property for this expression
              const properties = chunks[index].match(cssPropRegex);

              const targetProperty = properties?.[properties.length - 1];

              // remove matched property from template literal
              chunks[index] = chunks[index].replace(cssPropRegex, "").trim();

              // TODO: wip
              // grab partial values i.e. `1px solid `
              // if a partial value exists, we need to use a template literal for the object property value
              const partialVals = chunks[index].match(partialValueRegex);
              const partialVal = partialVals?.[1];
              const partials: (string | undefined)[] = [];
              partials[index] = partialVal;

              const members = buildMembersFromArray(objectProperties.slice(2));

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

export default main;
