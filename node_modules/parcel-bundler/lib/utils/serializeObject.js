"use strict";

const _require = require('terser'),
      minify = _require.minify;

const _require2 = require('serialize-to-js'),
      serialize = _require2.serialize;

function serializeObject(obj, shouldMinify = false) {
  let code = `module.exports = ${serialize(obj)};`;

  if (shouldMinify) {
    let minified = minify(code);

    if (minified.error) {
      throw minified.error;
    }

    code = minified.code;
  }

  return code;
}

module.exports = serializeObject;