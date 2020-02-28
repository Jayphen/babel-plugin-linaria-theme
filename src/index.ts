import { PluginObj } from "@babel/core";

function main(): PluginObj {
  return {
    visitor: {
      Program(path, state) {
        console.log(path, state);
      }
    }
  };
}

export default main;
