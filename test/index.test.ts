import main from "../src";
import pluginTester from "babel-plugin-tester";

pluginTester({
  plugin: main,
  snapshot: true,
  tests: [
    {
      title: "Array",
      pluginOptions: {
        minJSONStringSize: 0
      },
      code: `
const styles = css\`
  \${theme.below.sm} {
    color: red;
  };
  background: red;
  color: purple;
  margin: \${theme.default.sizes[1]};
  border: 1px solid \${theme.default.sizes[1]};
  border: 1px solid \${theme.default.sizes[1]};
  background: black;
  color: \${theme.default.colors.green};

      \``
    }
  ]
});
