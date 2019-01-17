"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

const path = require('path');

const JSX_EXTENSIONS = {
  '.jsx': true,
  '.tsx': true
};
const JSX_PRAGMA = {
  react: 'React.createElement',
  preact: 'h',
  nervjs: 'Nerv.createElement',
  hyperapp: 'h'
};
/**
 * Generates a babel config for JSX. Attempts to detect react or react-like libraries
 * and changes the pragma accordingly.
 */

function getJSXConfig(_x, _x2) {
  return _getJSXConfig.apply(this, arguments);
}

function _getJSXConfig() {
  _getJSXConfig = (0, _asyncToGenerator2.default)(function* (asset, isSourceModule) {
    // Don't enable JSX in node_modules
    if (!isSourceModule) {
      return null;
    }

    let pkg = yield asset.getPackage(); // Find a dependency that we can map to a JSX pragma

    let pragma = null;

    for (let dep in JSX_PRAGMA) {
      if (pkg && (pkg.dependencies && pkg.dependencies[dep] || pkg.devDependencies && pkg.devDependencies[dep])) {
        pragma = JSX_PRAGMA[dep];
        break;
      }
    }

    if (pragma || JSX_EXTENSIONS[path.extname(asset.name)]) {
      return {
        internal: true,
        babelVersion: 7,
        config: {
          plugins: [[require('@babel/plugin-transform-react-jsx'), {
            pragma
          }]]
        }
      };
    }
  });
  return _getJSXConfig.apply(this, arguments);
}

module.exports = getJSXConfig;