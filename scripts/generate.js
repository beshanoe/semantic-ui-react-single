const fs = require("fs");
const rimraf = require("rimraf");
const path = require("path");
const { getJsImports, getCssImports } = require("./get-imports-utils");

const generateContent = (name, propsName, jsFileName, cssFileName) =>
  [
    `import ${name}, { ${propsName} } from "semantic-ui-react${jsFileName}";`,
    cssFileName && `import "${cssFileName}";`,
    `export { ${name}, ${propsName} };`
  ].join("\n");

function generate() {
  const jsImports = getJsImports("commonjs");
  const cssImports = getCssImports(true);

  Object.keys(jsImports)
    .map(name => {
      const jsFileName = jsImports[name];
      const cssFileName = cssImports[name.toLowerCase()];
      return {
        name,
        jsFileName,
        cssFileName
      };
    })
    .map(({ name, jsFileName, cssFileName }) => ({
      name,
      content: generateContent(name, `${name}Props`, jsFileName, cssFileName)
    }))
    .forEach(({ name, content }) => {
      fs.writeFile(`../src/${name}.ts`, content, err => {
        if (err) {
          console.log(name, err);
        }
      });
    });
}

rimraf("./src/*", err => {
  if (err) {
    console.error(err);
  }
  generate();
  fs.writeFile("../src/index.ts", "", () => {});
});
