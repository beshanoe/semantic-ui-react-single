var path = require("path");
var fs = require("fs");
var dirTree = require("directory-tree");

var cache = {
  jsImports: {},
  cssImports: null,
  lessImports: null
};

/**
 * Prints a tagged warning message.
 * @param msg The warning message
 */
function warn(msg) {
  console.log(TAG + " " + colors.bold.black.bgYellow("WARNING") + " " + msg);
}

/**
 * Throws an Error with a tagged error message.
 * @param msg The error message
 */
function error(msg) {
  throw new Error(TAG + " " + msg);
}

/**
 * Returns the path to the given package.
 * @param packageName The package name
 * @returns {*} The package path
 */
function getPackagePath(packageName) {
  try {
    return path.dirname(require.resolve(packageName + "/package.json"));
  } catch (e) {
    return null;
  }
}

/**
 * Gathers import paths of Semantic UI React components from semantic-ui-react package folder.
 * @param importType Type of the import (es, commonjs, umd or src).
 * @returns {*} An object where the keys are Semantic UI React component names and the values are the corresponding
 * import paths (relative to semantic-ui-react/dist/[import type]/ or semantic-ui-react/src/ (for importType='src').
 */
function getJsImports(importType) {
  if (cache.jsImports[importType]) {
    return cache.jsImports[importType];
  }

  var unprefixedImports = {};

  if (cache.jsImports._unprefixedImports) {
    unprefixedImports = cache.jsImports._unprefixedImports;
  } else {
    var semanticUiReactPath = getPackagePath("semantic-ui-react");
    if (!semanticUiReactPath) {
      error(
        "Package semantic-ui-react could not be found. Install semantic-ui-react or set convertMemberImports " +
          "to false."
      );
    }

    var srcDirPath = path.resolve(semanticUiReactPath, "src");

    var searchFolders = [
      "addons",
      "behaviors",
      "collections",
      "elements",
      "modules",
      "views"
    ];

    searchFolders.forEach(function(searchFolder) {
      var searchRoot = path.resolve(srcDirPath, searchFolder);

      const tree = dirTree(searchRoot, { extensions: /\.js$/ });

      tree.children.forEach(function(item) {
        var basename = path.basename(item.path, ".js");

        // skip files that do not start with an uppercase letter
        if (/[^A-Z]/.test(basename[0])) {
          return;
        }

        if (unprefixedImports[basename]) {
          error(
            "duplicate react component name '" +
              basename +
              "' - probably the plugin needs an update"
          );
        }
        unprefixedImports[basename] = item.path
          .substring(srcDirPath.length)
          .replace(/\\/g, "/");
      });
    });

    cache.jsImports._unprefixedImports = unprefixedImports;
  }

  var prefix;
  if (importType === "src") {
    prefix = "/src";
  } else {
    prefix = "/dist/" + importType;
  }

  cache.jsImports[importType] = {};
  for (var key in unprefixedImports) {
    if (unprefixedImports.hasOwnProperty(key)) {
      cache.jsImports[importType][key] = prefix + unprefixedImports[key];
    }
  }

  return cache.jsImports[importType];
}

/**
 * Gathers import paths for .css files from semantic-ui-css/components
 * @param returnMinified If true, returns import paths for minified css files.
 * @returns {*} An Object where the keys are semantic-ui-css component names and the values are the corresponding import
 * paths.
 */
function getCssImports(returnMinified) {
  var returnVersion = returnMinified ? "minified" : "unminified";
  if (cache.cssImports) return cache.cssImports[returnVersion];

  var semanticUiCssPath = getPackagePath("semantic-ui-css");
  if (!semanticUiCssPath) {
    error(
      "Package semantic-ui-css could not be found. Install semantic-ui-css or set addCssImports to false."
    );
  }

  var componentsDirPath = path.resolve(semanticUiCssPath, "components");

  var cssImports = {
    unminified: {},
    minified: {}
  };
  var componentFiles = fs.readdirSync(componentsDirPath);
  componentFiles
    .filter(function(componentFile) {
      return componentFile.match(/\.css$/i);
    })
    .forEach(function(componentFile) {
      var minified = componentFile.match(/\.min\.css$/i);
      var version = minified ? "minified" : "unminified";
      var extension = minified ? ".min.css" : ".css";
      var component = path.basename(componentFile, extension);

      if (cssImports[version][component]) {
        error(
          "duplicate " +
            version +
            " css component name '" +
            component +
            "' - probably the plugin needs an " +
            "update"
        );
      }

      cssImports[version][component] =
        "semantic-ui-css/components/" + componentFile;
    });

  cache.cssImports = cssImports;
  return cssImports[returnVersion];
}

/**
 * Extracts import paths for .less files from semantic-ui-less/semantic.less file.
 * @returns {{}} An object where the keys are semantic-ui-less component names and the values are the corresponding
 * import paths.
 */
function getLessImports() {
  if (cache.lessImports) return cache.lessImports;

  var semanticUiLessPath = getPackagePath("semantic-ui-less");
  if (!semanticUiLessPath) {
    error(
      "Package semantic-ui-less could not be found. Install semantic-ui-less or set addLessImports to false."
    );
  }

  var lessImportsFilePath = path.resolve(semanticUiLessPath, "semantic.less");
  var lessImportsFile = fs.readFileSync(lessImportsFilePath, "utf8");

  var importRegex = /@import\s+"([^"]+)"/g;
  var lessImports = {};
  var match;
  while ((match = importRegex.exec(lessImportsFile))) {
    var importPath = match[1];
    var component = importPath.substring(importPath.lastIndexOf("/") + 1);
    if (lessImports[component]) {
      error(
        "duplicate less component name '" +
          component +
          "' - probably the plugin needs an update"
      );
    }
    lessImports[component] = "semantic-ui-less/" + importPath + ".less";
  }

  cache.lessImports = lessImports;
  return lessImports;
}

module.exports = {
  getJsImports,
  getCssImports
};
