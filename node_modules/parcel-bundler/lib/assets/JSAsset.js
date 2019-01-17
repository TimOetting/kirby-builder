"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

const traverse = require('@babel/traverse').default;

const codeFrame = require('@babel/code-frame').codeFrameColumns;

const collectDependencies = require('../visitors/dependencies');

const walk = require('babylon-walk');

const Asset = require('../Asset');

const babelParser = require('@babel/parser');

const insertGlobals = require('../visitors/globals');

const fsVisitor = require('../visitors/fs');

const envVisitor = require('../visitors/env');

const babel = require('../transforms/babel/transform');

const babel7 = require('../transforms/babel/babel7');

const generate = require('@babel/generator').default;

const terser = require('../transforms/terser');

const SourceMap = require('../SourceMap');

const hoist = require('../scope-hoisting/hoist');

const path = require('path');

const fs = require('@parcel/fs');

const logger = require('@parcel/logger');

const IMPORT_RE = /\b(?:import\b|export\b|require\s*\()/;
const ENV_RE = /\b(?:process\.env)\b/;
const GLOBAL_RE = /\b(?:process|__dirname|__filename|global|Buffer|define)\b/;
const FS_RE = /\breadFileSync\b/;
const SW_RE = /\bnavigator\s*\.\s*serviceWorker\s*\.\s*register\s*\(/;
const WORKER_RE = /\bnew\s*(?:Shared)?Worker\s*\(/;
const SOURCEMAP_RE = /\/\/\s*[@#]\s*sourceMappingURL\s*=\s*([^\s]+)/;
const DATA_URL_RE = /^data:[^;]+(?:;charset=[^;]+)?;base64,(.*)/;

class JSAsset extends Asset {
  constructor(name, options) {
    super(name, options);
    this.type = 'js';
    this.globals = new Map();
    this.isAstDirty = false;
    this.isES6Module = false;
    this.outputCode = null;
    this.cacheData.env = {};
    this.rendition = options.rendition;
    this.sourceMap = this.rendition ? this.rendition.sourceMap : null;
  }

  shouldInvalidate(cacheData) {
    for (let key in cacheData.env) {
      if (cacheData.env[key] !== process.env[key]) {
        return true;
      }
    }

    return false;
  }

  mightHaveDependencies() {
    return this.isAstDirty || !/.js$/.test(this.name) || IMPORT_RE.test(this.contents) || GLOBAL_RE.test(this.contents) || SW_RE.test(this.contents) || WORKER_RE.test(this.contents);
  }

  parse(code) {
    var _this = this;

    return (0, _asyncToGenerator2.default)(function* () {
      return babelParser.parse(code, {
        filename: _this.name,
        allowReturnOutsideFunction: true,
        strictMode: false,
        sourceType: 'module',
        plugins: ['exportDefaultFrom', 'exportNamespaceFrom', 'dynamicImport']
      });
    })();
  }

  traverse(visitor) {
    return traverse(this.ast, visitor, null, this);
  }

  traverseFast(visitor) {
    return walk.simple(this.ast, visitor, this);
  }

  collectDependencies() {
    walk.ancestor(this.ast, collectDependencies, this);
  }

  loadSourceMap() {
    var _this2 = this;

    return (0, _asyncToGenerator2.default)(function* () {
      // Get original sourcemap if there is any
      let match = _this2.contents.match(SOURCEMAP_RE);

      if (match) {
        _this2.contents = _this2.contents.replace(SOURCEMAP_RE, '');
        let url = match[1];
        let dataURLMatch = url.match(DATA_URL_RE);

        try {
          let json, filename;

          if (dataURLMatch) {
            filename = _this2.name;
            json = new Buffer(dataURLMatch[1], 'base64').toString();
          } else {
            filename = path.join(path.dirname(_this2.name), url);
            json = yield fs.readFile(filename, 'utf8'); // Add as a dep so we watch the source map for changes.

            _this2.addDependency(filename, {
              includedInParent: true
            });
          }

          _this2.sourceMap = JSON.parse(json); // Attempt to read missing source contents

          if (!_this2.sourceMap.sourcesContent) {
            _this2.sourceMap.sourcesContent = [];
          }

          let missingSources = _this2.sourceMap.sources.slice(_this2.sourceMap.sourcesContent.length);

          if (missingSources.length) {
            let contents = yield Promise.all(missingSources.map(
            /*#__PURE__*/
            function () {
              var _ref = (0, _asyncToGenerator2.default)(function* (source) {
                try {
                  let sourceFile = path.join(path.dirname(filename), _this2.sourceMap.sourceRoot || '', source);
                  let result = yield fs.readFile(sourceFile, 'utf8');

                  _this2.addDependency(sourceFile, {
                    includedInParent: true
                  });

                  return result;
                } catch (err) {
                  logger.warn(`Could not load source file "${source}" in source map of "${_this2.relativeName}".`);
                }
              });

              return function (_x) {
                return _ref.apply(this, arguments);
              };
            }()));
            _this2.sourceMap.sourcesContent = _this2.sourceMap.sourcesContent.concat(contents);
          }
        } catch (e) {
          logger.warn(`Could not load existing sourcemap of "${_this2.relativeName}".`);
        }
      }
    })();
  }

  pretransform() {
    var _this3 = this;

    return (0, _asyncToGenerator2.default)(function* () {
      if (_this3.options.sourceMaps) {
        yield _this3.loadSourceMap();
      }

      yield babel(_this3); // Inline environment variables

      if (_this3.options.target === 'browser' && ENV_RE.test(_this3.contents)) {
        yield _this3.parseIfNeeded();

        _this3.traverseFast(envVisitor);
      }
    })();
  }

  transform() {
    var _this4 = this;

    return (0, _asyncToGenerator2.default)(function* () {
      if (_this4.options.target === 'browser') {
        if (_this4.dependencies.has('fs') && FS_RE.test(_this4.contents)) {
          // Check if we should ignore fs calls
          // See https://github.com/defunctzombie/node-browser-resolve#skip
          let pkg = yield _this4.getPackage();
          let ignore = pkg && pkg.browser && pkg.browser.fs === false;

          if (!ignore) {
            yield _this4.parseIfNeeded();

            _this4.traverse(fsVisitor);
          }
        }

        if (GLOBAL_RE.test(_this4.contents)) {
          yield _this4.parseIfNeeded();
          walk.ancestor(_this4.ast, insertGlobals, _this4);
        }
      }

      if (_this4.options.scopeHoist) {
        yield _this4.parseIfNeeded();
        yield _this4.getPackage();

        _this4.traverse(hoist);

        _this4.isAstDirty = true;
      } else {
        if (_this4.isES6Module) {
          yield babel7(_this4, {
            internal: true,
            config: {
              plugins: [require('@babel/plugin-transform-modules-commonjs')]
            }
          });
        }
      }

      if (_this4.options.minify) {
        yield terser(_this4);
      }
    })();
  }

  generate() {
    var _this5 = this;

    return (0, _asyncToGenerator2.default)(function* () {
      let enableSourceMaps = _this5.options.sourceMaps && (!_this5.rendition || !!_this5.rendition.sourceMap);
      let code;

      if (_this5.isAstDirty) {
        let opts = {
          sourceMaps: _this5.options.sourceMaps,
          sourceFileName: _this5.relativeName
        };
        let generated = generate(_this5.ast, opts, _this5.contents);

        if (enableSourceMaps && generated.rawMappings) {
          let rawMap = new SourceMap(generated.rawMappings, {
            [_this5.relativeName]: _this5.contents
          }); // Check if we already have a source map (e.g. from TypeScript or CoffeeScript)
          // In that case, we need to map the original source map to the babel generated one.

          if (_this5.sourceMap) {
            _this5.sourceMap = yield new SourceMap().extendSourceMap(_this5.sourceMap, rawMap);
          } else {
            _this5.sourceMap = rawMap;
          }
        }

        code = generated.code;
      } else {
        code = _this5.outputCode != null ? _this5.outputCode : _this5.contents;
      }

      if (enableSourceMaps && !_this5.sourceMap) {
        _this5.sourceMap = new SourceMap().generateEmptyMap(_this5.relativeName, _this5.contents);
      }

      if (_this5.globals.size > 0) {
        code = Array.from(_this5.globals.values()).join('\n') + '\n' + code;

        if (enableSourceMaps) {
          if (!(_this5.sourceMap instanceof SourceMap)) {
            _this5.sourceMap = yield new SourceMap().addMap(_this5.sourceMap);
          }

          _this5.sourceMap.offset(_this5.globals.size);
        }
      }

      return {
        js: code,
        map: _this5.sourceMap
      };
    })();
  }

  generateErrorMessage(err) {
    const loc = err.loc;

    if (loc) {
      // Babel 7 adds its own code frame on the error message itself
      // We need to remove it and pass it separately.
      if (err.message.startsWith(this.name)) {
        err.message = err.message.slice(this.name.length + 1, err.message.indexOf('\n')).trim();
      }

      err.codeFrame = codeFrame(this.contents, {
        start: loc
      });
      err.highlightedCodeFrame = codeFrame(this.contents, {
        start: loc
      }, {
        highlightCode: true
      });
    }

    return err;
  }

}

module.exports = JSAsset;