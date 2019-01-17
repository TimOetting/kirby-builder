"use strict";

exports.__esModule = true;
exports.default = void 0;

var _lazyResult = _interopRequireDefault(require("./lazy-result"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Contains plugins to process CSS. Create one `Processor` instance,
 * initialize its plugins, and then use that instance on numerous CSS files.
 *
 * @example
 * const processor = postcss([autoprefixer, precss])
 * processor.process(css1).then(result => console.log(result.css))
 * processor.process(css2).then(result => console.log(result.css))
 */
var Processor =
/*#__PURE__*/
function () {
  /**
   * @param {Array.<Plugin|pluginFunction>|Processor} plugins PostCSS plugins.
   *        See {@link Processor#use} for plugin format.
   */
  function Processor(plugins) {
    if (plugins === void 0) {
      plugins = [];
    }

    /**
     * Current PostCSS version.
     *
     * @type {string}
     *
     * @example
     * if (result.processor.version.split('.')[0] !== '6') {
     *   throw new Error('This plugin works only with PostCSS 6')
     * }
     */
    this.version = '7.0.7';
    /**
     * Plugins added to this processor.
     *
     * @type {pluginFunction[]}
     *
     * @example
     * const processor = postcss([autoprefixer, precss])
     * processor.plugins.length //=> 2
     */

    this.plugins = this.normalize(plugins);
  }
  /**
   * Adds a plugin to be used as a CSS processor.
   *
   * PostCSS plugin can be in 4 formats:
   * * A plugin created by {@link postcss.plugin} method.
   * * A function. PostCSS will pass the function a @{link Root}
   *   as the first argument and current {@link Result} instance
   *   as the second.
   * * An object with a `postcss` method. PostCSS will use that method
   *   as described in #2.
   * * Another {@link Processor} instance. PostCSS will copy plugins
   *   from that instance into this one.
   *
   * Plugins can also be added by passing them as arguments when creating
   * a `postcss` instance (see [`postcss(plugins)`]).
   *
   * Asynchronous plugins should return a `Promise` instance.
   *
   * @param {Plugin|pluginFunction|Processor} plugin PostCSS plugin
   *                                                 or {@link Processor}
   *                                                 with plugins.
   *
   * @example
   * const processor = postcss()
   *   .use(autoprefixer)
   *   .use(precss)
   *
   * @return {Processes} Current processor to make methods chain.
   */


  var _proto = Processor.prototype;

  _proto.use = function use(plugin) {
    this.plugins = this.plugins.concat(this.normalize([plugin]));
    return this;
  }
  /**
   * Parses source CSS and returns a {@link LazyResult} Promise proxy.
   * Because some plugins can be asynchronous it doesn’t make
   * any transformations. Transformations will be applied
   * in the {@link LazyResult} methods.
   *
   * @param {string|toString|Result} css String with input CSS or any object
   *                                     with a `toString()` method,
   *                                     like a Buffer. Optionally, send
   *                                     a {@link Result} instance
   *                                     and the processor will take
   *                                     the {@link Root} from it.
   * @param {processOptions} [opts]      Options.
   *
   * @return {LazyResult} Promise proxy.
   *
   * @example
   * processor.process(css, { from: 'a.css', to: 'a.out.css' })
   *   .then(result => {
   *      console.log(result.css)
   *   })
   */
  ;

  _proto.process = function (_process) {
    function process(_x) {
      return _process.apply(this, arguments);
    }

    process.toString = function () {
      return _process.toString();
    };

    return process;
  }(function (css, opts) {
    if (opts === void 0) {
      opts = {};
    }

    if (this.plugins.length === 0 && opts.parser === opts.stringifier) {
      if (process.env.NODE_ENV !== 'production') {
        if (typeof console !== 'undefined' && console.warn) {
          console.warn('You did not set any plugins, parser, or stringifier. ' + 'Right now, PostCSS does nothing. Pick plugins for your case ' + 'on https://www.postcss.parts/ and use them in postcss.config.js.');
        }
      }
    }

    return new _lazyResult.default(this, css, opts);
  });

  _proto.normalize = function normalize(plugins) {
    var normalized = [];

    for (var _iterator = plugins, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
      var _ref;

      if (_isArray) {
        if (_i >= _iterator.length) break;
        _ref = _iterator[_i++];
      } else {
        _i = _iterator.next();
        if (_i.done) break;
        _ref = _i.value;
      }

      var i = _ref;
      if (i.postcss) i = i.postcss;

      if (typeof i === 'object' && Array.isArray(i.plugins)) {
        normalized = normalized.concat(i.plugins);
      } else if (typeof i === 'function') {
        normalized.push(i);
      } else if (typeof i === 'object' && (i.parse || i.stringify)) {
        if (process.env.NODE_ENV !== 'production') {
          throw new Error('PostCSS syntaxes cannot be used as plugins. Instead, please use ' + 'one of the syntax/parser/stringifier options as outlined ' + 'in your PostCSS runner documentation.');
        }
      } else {
        throw new Error(i + ' is not a PostCSS plugin');
      }
    }

    return normalized;
  };

  return Processor;
}();

var _default = Processor;
/**
 * @callback builder
 * @param {string} part          Part of generated CSS connected to this node.
 * @param {Node}   node          AST node.
 * @param {"start"|"end"} [type] Node’s part type.
 */

/**
 * @callback parser
 *
 * @param {string|toString} css   String with input CSS or any object
 *                                with toString() method, like a Buffer.
 * @param {processOptions} [opts] Options with only `from` and `map` keys.
 *
 * @return {Root} PostCSS AST
 */

/**
 * @callback stringifier
 *
 * @param {Node} node       Start node for stringifing. Usually {@link Root}.
 * @param {builder} builder Function to concatenate CSS from node’s parts
 *                          or generate string and source map.
 *
 * @return {void}
 */

/**
 * @typedef {object} syntax
 * @property {parser} parse          Function to generate AST by string.
 * @property {stringifier} stringify Function to generate string by AST.
 */

/**
 * @typedef {object} toString
 * @property {function} toString
 */

/**
 * @callback pluginFunction
 * @param {Root} root     Parsed input CSS.
 * @param {Result} result Result to set warnings or check other plugins.
 */

/**
 * @typedef {object} Plugin
 * @property {function} postcss PostCSS plugin function.
 */

/**
 * @typedef {object} processOptions
 * @property {string} from             The path of the CSS source file.
 *                                     You should always set `from`,
 *                                     because it is used in source map
 *                                     generation and syntax error messages.
 * @property {string} to               The path where you’ll put the output
 *                                     CSS file. You should always set `to`
 *                                     to generate correct source maps.
 * @property {parser} parser           Function to generate AST by string.
 * @property {stringifier} stringifier Class to generate string by AST.
 * @property {syntax} syntax           Object with `parse` and `stringify`.
 * @property {object} map              Source map options.
 * @property {boolean} map.inline                    Does source map should
 *                                                   be embedded in the output
 *                                                   CSS as a base64-encoded
 *                                                   comment.
 * @property {string|object|false|function} map.prev Source map content
 *                                                   from a previous
 *                                                   processing step
 *                                                   (for example, Sass).
 *                                                   PostCSS will try to find
 *                                                   previous map automatically,
 *                                                   so you could disable it by
 *                                                   `false` value.
 * @property {boolean} map.sourcesContent            Does PostCSS should set
 *                                                   the origin content to map.
 * @property {string|false} map.annotation           Does PostCSS should set
 *                                                   annotation comment to map.
 * @property {string} map.from                       Override `from` in map’s
 *                                                   sources`.
 */

exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInByb2Nlc3Nvci5lczYiXSwibmFtZXMiOlsiUHJvY2Vzc29yIiwicGx1Z2lucyIsInZlcnNpb24iLCJub3JtYWxpemUiLCJ1c2UiLCJwbHVnaW4iLCJjb25jYXQiLCJwcm9jZXNzIiwiY3NzIiwib3B0cyIsImxlbmd0aCIsInBhcnNlciIsInN0cmluZ2lmaWVyIiwiZW52IiwiTk9ERV9FTlYiLCJjb25zb2xlIiwid2FybiIsIkxhenlSZXN1bHQiLCJub3JtYWxpemVkIiwiaSIsInBvc3Rjc3MiLCJBcnJheSIsImlzQXJyYXkiLCJwdXNoIiwicGFyc2UiLCJzdHJpbmdpZnkiLCJFcnJvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQTs7OztBQUVBOzs7Ozs7Ozs7SUFTTUEsUzs7O0FBQ0o7Ozs7QUFJQSxxQkFBYUMsT0FBYixFQUEyQjtBQUFBLFFBQWRBLE9BQWM7QUFBZEEsTUFBQUEsT0FBYyxHQUFKLEVBQUk7QUFBQTs7QUFDekI7Ozs7Ozs7Ozs7QUFVQSxTQUFLQyxPQUFMLEdBQWUsT0FBZjtBQUNBOzs7Ozs7Ozs7O0FBU0EsU0FBS0QsT0FBTCxHQUFlLEtBQUtFLFNBQUwsQ0FBZUYsT0FBZixDQUFmO0FBQ0Q7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1NBNkJBRyxHLEdBQUEsYUFBS0MsTUFBTCxFQUFhO0FBQ1gsU0FBS0osT0FBTCxHQUFlLEtBQUtBLE9BQUwsQ0FBYUssTUFBYixDQUFvQixLQUFLSCxTQUFMLENBQWUsQ0FBQ0UsTUFBRCxDQUFmLENBQXBCLENBQWY7QUFDQSxXQUFPLElBQVA7QUFDRDtBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7U0FzQkFFLE87Ozs7Ozs7Ozs7SUFBQSxVQUFTQyxHQUFULEVBQWNDLElBQWQsRUFBMEI7QUFBQSxRQUFaQSxJQUFZO0FBQVpBLE1BQUFBLElBQVksR0FBTCxFQUFLO0FBQUE7O0FBQ3hCLFFBQUksS0FBS1IsT0FBTCxDQUFhUyxNQUFiLEtBQXdCLENBQXhCLElBQTZCRCxJQUFJLENBQUNFLE1BQUwsS0FBZ0JGLElBQUksQ0FBQ0csV0FBdEQsRUFBbUU7QUFDakUsVUFBSUwsT0FBTyxDQUFDTSxHQUFSLENBQVlDLFFBQVosS0FBeUIsWUFBN0IsRUFBMkM7QUFDekMsWUFBSSxPQUFPQyxPQUFQLEtBQW1CLFdBQW5CLElBQWtDQSxPQUFPLENBQUNDLElBQTlDLEVBQW9EO0FBQ2xERCxVQUFBQSxPQUFPLENBQUNDLElBQVIsQ0FDRSwwREFDQSw4REFEQSxHQUVBLGtFQUhGO0FBS0Q7QUFDRjtBQUNGOztBQUNELFdBQU8sSUFBSUMsbUJBQUosQ0FBZSxJQUFmLEVBQXFCVCxHQUFyQixFQUEwQkMsSUFBMUIsQ0FBUDtBQUNELEc7O1NBRUROLFMsR0FBQSxtQkFBV0YsT0FBWCxFQUFvQjtBQUNsQixRQUFJaUIsVUFBVSxHQUFHLEVBQWpCOztBQUNBLHlCQUFjakIsT0FBZCxrSEFBdUI7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBLFVBQWRrQixDQUFjO0FBQ3JCLFVBQUlBLENBQUMsQ0FBQ0MsT0FBTixFQUFlRCxDQUFDLEdBQUdBLENBQUMsQ0FBQ0MsT0FBTjs7QUFFZixVQUFJLE9BQU9ELENBQVAsS0FBYSxRQUFiLElBQXlCRSxLQUFLLENBQUNDLE9BQU4sQ0FBY0gsQ0FBQyxDQUFDbEIsT0FBaEIsQ0FBN0IsRUFBdUQ7QUFDckRpQixRQUFBQSxVQUFVLEdBQUdBLFVBQVUsQ0FBQ1osTUFBWCxDQUFrQmEsQ0FBQyxDQUFDbEIsT0FBcEIsQ0FBYjtBQUNELE9BRkQsTUFFTyxJQUFJLE9BQU9rQixDQUFQLEtBQWEsVUFBakIsRUFBNkI7QUFDbENELFFBQUFBLFVBQVUsQ0FBQ0ssSUFBWCxDQUFnQkosQ0FBaEI7QUFDRCxPQUZNLE1BRUEsSUFBSSxPQUFPQSxDQUFQLEtBQWEsUUFBYixLQUEwQkEsQ0FBQyxDQUFDSyxLQUFGLElBQVdMLENBQUMsQ0FBQ00sU0FBdkMsQ0FBSixFQUF1RDtBQUM1RCxZQUFJbEIsT0FBTyxDQUFDTSxHQUFSLENBQVlDLFFBQVosS0FBeUIsWUFBN0IsRUFBMkM7QUFDekMsZ0JBQU0sSUFBSVksS0FBSixDQUNKLHFFQUNBLDJEQURBLEdBRUEsdUNBSEksQ0FBTjtBQUtEO0FBQ0YsT0FSTSxNQVFBO0FBQ0wsY0FBTSxJQUFJQSxLQUFKLENBQVVQLENBQUMsR0FBRywwQkFBZCxDQUFOO0FBQ0Q7QUFDRjs7QUFDRCxXQUFPRCxVQUFQO0FBQ0QsRzs7Ozs7ZUFHWWxCLFM7QUFFZjs7Ozs7OztBQU9BOzs7Ozs7Ozs7O0FBVUE7Ozs7Ozs7Ozs7QUFVQTs7Ozs7O0FBTUE7Ozs7O0FBS0E7Ozs7OztBQU1BOzs7OztBQUtBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExhenlSZXN1bHQgZnJvbSAnLi9sYXp5LXJlc3VsdCdcblxuLyoqXG4gKiBDb250YWlucyBwbHVnaW5zIHRvIHByb2Nlc3MgQ1NTLiBDcmVhdGUgb25lIGBQcm9jZXNzb3JgIGluc3RhbmNlLFxuICogaW5pdGlhbGl6ZSBpdHMgcGx1Z2lucywgYW5kIHRoZW4gdXNlIHRoYXQgaW5zdGFuY2Ugb24gbnVtZXJvdXMgQ1NTIGZpbGVzLlxuICpcbiAqIEBleGFtcGxlXG4gKiBjb25zdCBwcm9jZXNzb3IgPSBwb3N0Y3NzKFthdXRvcHJlZml4ZXIsIHByZWNzc10pXG4gKiBwcm9jZXNzb3IucHJvY2Vzcyhjc3MxKS50aGVuKHJlc3VsdCA9PiBjb25zb2xlLmxvZyhyZXN1bHQuY3NzKSlcbiAqIHByb2Nlc3Nvci5wcm9jZXNzKGNzczIpLnRoZW4ocmVzdWx0ID0+IGNvbnNvbGUubG9nKHJlc3VsdC5jc3MpKVxuICovXG5jbGFzcyBQcm9jZXNzb3Ige1xuICAvKipcbiAgICogQHBhcmFtIHtBcnJheS48UGx1Z2lufHBsdWdpbkZ1bmN0aW9uPnxQcm9jZXNzb3J9IHBsdWdpbnMgUG9zdENTUyBwbHVnaW5zLlxuICAgKiAgICAgICAgU2VlIHtAbGluayBQcm9jZXNzb3IjdXNlfSBmb3IgcGx1Z2luIGZvcm1hdC5cbiAgICovXG4gIGNvbnN0cnVjdG9yIChwbHVnaW5zID0gW10pIHtcbiAgICAvKipcbiAgICAgKiBDdXJyZW50IFBvc3RDU1MgdmVyc2lvbi5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGlmIChyZXN1bHQucHJvY2Vzc29yLnZlcnNpb24uc3BsaXQoJy4nKVswXSAhPT0gJzYnKSB7XG4gICAgICogICB0aHJvdyBuZXcgRXJyb3IoJ1RoaXMgcGx1Z2luIHdvcmtzIG9ubHkgd2l0aCBQb3N0Q1NTIDYnKVxuICAgICAqIH1cbiAgICAgKi9cbiAgICB0aGlzLnZlcnNpb24gPSAnNy4wLjcnXG4gICAgLyoqXG4gICAgICogUGx1Z2lucyBhZGRlZCB0byB0aGlzIHByb2Nlc3Nvci5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtwbHVnaW5GdW5jdGlvbltdfVxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBwcm9jZXNzb3IgPSBwb3N0Y3NzKFthdXRvcHJlZml4ZXIsIHByZWNzc10pXG4gICAgICogcHJvY2Vzc29yLnBsdWdpbnMubGVuZ3RoIC8vPT4gMlxuICAgICAqL1xuICAgIHRoaXMucGx1Z2lucyA9IHRoaXMubm9ybWFsaXplKHBsdWdpbnMpXG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhIHBsdWdpbiB0byBiZSB1c2VkIGFzIGEgQ1NTIHByb2Nlc3Nvci5cbiAgICpcbiAgICogUG9zdENTUyBwbHVnaW4gY2FuIGJlIGluIDQgZm9ybWF0czpcbiAgICogKiBBIHBsdWdpbiBjcmVhdGVkIGJ5IHtAbGluayBwb3N0Y3NzLnBsdWdpbn0gbWV0aG9kLlxuICAgKiAqIEEgZnVuY3Rpb24uIFBvc3RDU1Mgd2lsbCBwYXNzIHRoZSBmdW5jdGlvbiBhIEB7bGluayBSb290fVxuICAgKiAgIGFzIHRoZSBmaXJzdCBhcmd1bWVudCBhbmQgY3VycmVudCB7QGxpbmsgUmVzdWx0fSBpbnN0YW5jZVxuICAgKiAgIGFzIHRoZSBzZWNvbmQuXG4gICAqICogQW4gb2JqZWN0IHdpdGggYSBgcG9zdGNzc2AgbWV0aG9kLiBQb3N0Q1NTIHdpbGwgdXNlIHRoYXQgbWV0aG9kXG4gICAqICAgYXMgZGVzY3JpYmVkIGluICMyLlxuICAgKiAqIEFub3RoZXIge0BsaW5rIFByb2Nlc3Nvcn0gaW5zdGFuY2UuIFBvc3RDU1Mgd2lsbCBjb3B5IHBsdWdpbnNcbiAgICogICBmcm9tIHRoYXQgaW5zdGFuY2UgaW50byB0aGlzIG9uZS5cbiAgICpcbiAgICogUGx1Z2lucyBjYW4gYWxzbyBiZSBhZGRlZCBieSBwYXNzaW5nIHRoZW0gYXMgYXJndW1lbnRzIHdoZW4gY3JlYXRpbmdcbiAgICogYSBgcG9zdGNzc2AgaW5zdGFuY2UgKHNlZSBbYHBvc3Rjc3MocGx1Z2lucylgXSkuXG4gICAqXG4gICAqIEFzeW5jaHJvbm91cyBwbHVnaW5zIHNob3VsZCByZXR1cm4gYSBgUHJvbWlzZWAgaW5zdGFuY2UuXG4gICAqXG4gICAqIEBwYXJhbSB7UGx1Z2lufHBsdWdpbkZ1bmN0aW9ufFByb2Nlc3Nvcn0gcGx1Z2luIFBvc3RDU1MgcGx1Z2luXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yIHtAbGluayBQcm9jZXNzb3J9XG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpdGggcGx1Z2lucy5cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogY29uc3QgcHJvY2Vzc29yID0gcG9zdGNzcygpXG4gICAqICAgLnVzZShhdXRvcHJlZml4ZXIpXG4gICAqICAgLnVzZShwcmVjc3MpXG4gICAqXG4gICAqIEByZXR1cm4ge1Byb2Nlc3Nlc30gQ3VycmVudCBwcm9jZXNzb3IgdG8gbWFrZSBtZXRob2RzIGNoYWluLlxuICAgKi9cbiAgdXNlIChwbHVnaW4pIHtcbiAgICB0aGlzLnBsdWdpbnMgPSB0aGlzLnBsdWdpbnMuY29uY2F0KHRoaXMubm9ybWFsaXplKFtwbHVnaW5dKSlcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyoqXG4gICAqIFBhcnNlcyBzb3VyY2UgQ1NTIGFuZCByZXR1cm5zIGEge0BsaW5rIExhenlSZXN1bHR9IFByb21pc2UgcHJveHkuXG4gICAqIEJlY2F1c2Ugc29tZSBwbHVnaW5zIGNhbiBiZSBhc3luY2hyb25vdXMgaXQgZG9lc27igJl0IG1ha2VcbiAgICogYW55IHRyYW5zZm9ybWF0aW9ucy4gVHJhbnNmb3JtYXRpb25zIHdpbGwgYmUgYXBwbGllZFxuICAgKiBpbiB0aGUge0BsaW5rIExhenlSZXN1bHR9IG1ldGhvZHMuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfHRvU3RyaW5nfFJlc3VsdH0gY3NzIFN0cmluZyB3aXRoIGlucHV0IENTUyBvciBhbnkgb2JqZWN0XG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpdGggYSBgdG9TdHJpbmcoKWAgbWV0aG9kLFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaWtlIGEgQnVmZmVyLiBPcHRpb25hbGx5LCBzZW5kXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGEge0BsaW5rIFJlc3VsdH0gaW5zdGFuY2VcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5kIHRoZSBwcm9jZXNzb3Igd2lsbCB0YWtlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZSB7QGxpbmsgUm9vdH0gZnJvbSBpdC5cbiAgICogQHBhcmFtIHtwcm9jZXNzT3B0aW9uc30gW29wdHNdICAgICAgT3B0aW9ucy5cbiAgICpcbiAgICogQHJldHVybiB7TGF6eVJlc3VsdH0gUHJvbWlzZSBwcm94eS5cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogcHJvY2Vzc29yLnByb2Nlc3MoY3NzLCB7IGZyb206ICdhLmNzcycsIHRvOiAnYS5vdXQuY3NzJyB9KVxuICAgKiAgIC50aGVuKHJlc3VsdCA9PiB7XG4gICAqICAgICAgY29uc29sZS5sb2cocmVzdWx0LmNzcylcbiAgICogICB9KVxuICAgKi9cbiAgcHJvY2VzcyAoY3NzLCBvcHRzID0geyB9KSB7XG4gICAgaWYgKHRoaXMucGx1Z2lucy5sZW5ndGggPT09IDAgJiYgb3B0cy5wYXJzZXIgPT09IG9wdHMuc3RyaW5naWZpZXIpIHtcbiAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICAgIGlmICh0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcgJiYgY29uc29sZS53YXJuKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgICAgJ1lvdSBkaWQgbm90IHNldCBhbnkgcGx1Z2lucywgcGFyc2VyLCBvciBzdHJpbmdpZmllci4gJyArXG4gICAgICAgICAgICAnUmlnaHQgbm93LCBQb3N0Q1NTIGRvZXMgbm90aGluZy4gUGljayBwbHVnaW5zIGZvciB5b3VyIGNhc2UgJyArXG4gICAgICAgICAgICAnb24gaHR0cHM6Ly93d3cucG9zdGNzcy5wYXJ0cy8gYW5kIHVzZSB0aGVtIGluIHBvc3Rjc3MuY29uZmlnLmpzLidcbiAgICAgICAgICApXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5ldyBMYXp5UmVzdWx0KHRoaXMsIGNzcywgb3B0cylcbiAgfVxuXG4gIG5vcm1hbGl6ZSAocGx1Z2lucykge1xuICAgIGxldCBub3JtYWxpemVkID0gW11cbiAgICBmb3IgKGxldCBpIG9mIHBsdWdpbnMpIHtcbiAgICAgIGlmIChpLnBvc3Rjc3MpIGkgPSBpLnBvc3Rjc3NcblxuICAgICAgaWYgKHR5cGVvZiBpID09PSAnb2JqZWN0JyAmJiBBcnJheS5pc0FycmF5KGkucGx1Z2lucykpIHtcbiAgICAgICAgbm9ybWFsaXplZCA9IG5vcm1hbGl6ZWQuY29uY2F0KGkucGx1Z2lucylcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGkgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgbm9ybWFsaXplZC5wdXNoKGkpXG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBpID09PSAnb2JqZWN0JyAmJiAoaS5wYXJzZSB8fCBpLnN0cmluZ2lmeSkpIHtcbiAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAnUG9zdENTUyBzeW50YXhlcyBjYW5ub3QgYmUgdXNlZCBhcyBwbHVnaW5zLiBJbnN0ZWFkLCBwbGVhc2UgdXNlICcgK1xuICAgICAgICAgICAgJ29uZSBvZiB0aGUgc3ludGF4L3BhcnNlci9zdHJpbmdpZmllciBvcHRpb25zIGFzIG91dGxpbmVkICcgK1xuICAgICAgICAgICAgJ2luIHlvdXIgUG9zdENTUyBydW5uZXIgZG9jdW1lbnRhdGlvbi4nXG4gICAgICAgICAgKVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoaSArICcgaXMgbm90IGEgUG9zdENTUyBwbHVnaW4nKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbm9ybWFsaXplZFxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFByb2Nlc3NvclxuXG4vKipcbiAqIEBjYWxsYmFjayBidWlsZGVyXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFydCAgICAgICAgICBQYXJ0IG9mIGdlbmVyYXRlZCBDU1MgY29ubmVjdGVkIHRvIHRoaXMgbm9kZS5cbiAqIEBwYXJhbSB7Tm9kZX0gICBub2RlICAgICAgICAgIEFTVCBub2RlLlxuICogQHBhcmFtIHtcInN0YXJ0XCJ8XCJlbmRcIn0gW3R5cGVdIE5vZGXigJlzIHBhcnQgdHlwZS5cbiAqL1xuXG4vKipcbiAqIEBjYWxsYmFjayBwYXJzZXJcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ3x0b1N0cmluZ30gY3NzICAgU3RyaW5nIHdpdGggaW5wdXQgQ1NTIG9yIGFueSBvYmplY3RcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aXRoIHRvU3RyaW5nKCkgbWV0aG9kLCBsaWtlIGEgQnVmZmVyLlxuICogQHBhcmFtIHtwcm9jZXNzT3B0aW9uc30gW29wdHNdIE9wdGlvbnMgd2l0aCBvbmx5IGBmcm9tYCBhbmQgYG1hcGAga2V5cy5cbiAqXG4gKiBAcmV0dXJuIHtSb290fSBQb3N0Q1NTIEFTVFxuICovXG5cbi8qKlxuICogQGNhbGxiYWNrIHN0cmluZ2lmaWVyXG4gKlxuICogQHBhcmFtIHtOb2RlfSBub2RlICAgICAgIFN0YXJ0IG5vZGUgZm9yIHN0cmluZ2lmaW5nLiBVc3VhbGx5IHtAbGluayBSb290fS5cbiAqIEBwYXJhbSB7YnVpbGRlcn0gYnVpbGRlciBGdW5jdGlvbiB0byBjb25jYXRlbmF0ZSBDU1MgZnJvbSBub2Rl4oCZcyBwYXJ0c1xuICogICAgICAgICAgICAgICAgICAgICAgICAgIG9yIGdlbmVyYXRlIHN0cmluZyBhbmQgc291cmNlIG1hcC5cbiAqXG4gKiBAcmV0dXJuIHt2b2lkfVxuICovXG5cbi8qKlxuICogQHR5cGVkZWYge29iamVjdH0gc3ludGF4XG4gKiBAcHJvcGVydHkge3BhcnNlcn0gcGFyc2UgICAgICAgICAgRnVuY3Rpb24gdG8gZ2VuZXJhdGUgQVNUIGJ5IHN0cmluZy5cbiAqIEBwcm9wZXJ0eSB7c3RyaW5naWZpZXJ9IHN0cmluZ2lmeSBGdW5jdGlvbiB0byBnZW5lcmF0ZSBzdHJpbmcgYnkgQVNULlxuICovXG5cbi8qKlxuICogQHR5cGVkZWYge29iamVjdH0gdG9TdHJpbmdcbiAqIEBwcm9wZXJ0eSB7ZnVuY3Rpb259IHRvU3RyaW5nXG4gKi9cblxuLyoqXG4gKiBAY2FsbGJhY2sgcGx1Z2luRnVuY3Rpb25cbiAqIEBwYXJhbSB7Um9vdH0gcm9vdCAgICAgUGFyc2VkIGlucHV0IENTUy5cbiAqIEBwYXJhbSB7UmVzdWx0fSByZXN1bHQgUmVzdWx0IHRvIHNldCB3YXJuaW5ncyBvciBjaGVjayBvdGhlciBwbHVnaW5zLlxuICovXG5cbi8qKlxuICogQHR5cGVkZWYge29iamVjdH0gUGx1Z2luXG4gKiBAcHJvcGVydHkge2Z1bmN0aW9ufSBwb3N0Y3NzIFBvc3RDU1MgcGx1Z2luIGZ1bmN0aW9uLlxuICovXG5cbi8qKlxuICogQHR5cGVkZWYge29iamVjdH0gcHJvY2Vzc09wdGlvbnNcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBmcm9tICAgICAgICAgICAgIFRoZSBwYXRoIG9mIHRoZSBDU1Mgc291cmNlIGZpbGUuXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBZb3Ugc2hvdWxkIGFsd2F5cyBzZXQgYGZyb21gLFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmVjYXVzZSBpdCBpcyB1c2VkIGluIHNvdXJjZSBtYXBcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdlbmVyYXRpb24gYW5kIHN5bnRheCBlcnJvciBtZXNzYWdlcy5cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB0byAgICAgICAgICAgICAgIFRoZSBwYXRoIHdoZXJlIHlvdeKAmWxsIHB1dCB0aGUgb3V0cHV0XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBDU1MgZmlsZS4gWW91IHNob3VsZCBhbHdheXMgc2V0IGB0b2BcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvIGdlbmVyYXRlIGNvcnJlY3Qgc291cmNlIG1hcHMuXG4gKiBAcHJvcGVydHkge3BhcnNlcn0gcGFyc2VyICAgICAgICAgICBGdW5jdGlvbiB0byBnZW5lcmF0ZSBBU1QgYnkgc3RyaW5nLlxuICogQHByb3BlcnR5IHtzdHJpbmdpZmllcn0gc3RyaW5naWZpZXIgQ2xhc3MgdG8gZ2VuZXJhdGUgc3RyaW5nIGJ5IEFTVC5cbiAqIEBwcm9wZXJ0eSB7c3ludGF4fSBzeW50YXggICAgICAgICAgIE9iamVjdCB3aXRoIGBwYXJzZWAgYW5kIGBzdHJpbmdpZnlgLlxuICogQHByb3BlcnR5IHtvYmplY3R9IG1hcCAgICAgICAgICAgICAgU291cmNlIG1hcCBvcHRpb25zLlxuICogQHByb3BlcnR5IHtib29sZWFufSBtYXAuaW5saW5lICAgICAgICAgICAgICAgICAgICBEb2VzIHNvdXJjZSBtYXAgc2hvdWxkXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJlIGVtYmVkZGVkIGluIHRoZSBvdXRwdXRcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQ1NTIGFzIGEgYmFzZTY0LWVuY29kZWRcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tbWVudC5cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfG9iamVjdHxmYWxzZXxmdW5jdGlvbn0gbWFwLnByZXYgU291cmNlIG1hcCBjb250ZW50XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb20gYSBwcmV2aW91c1xuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9jZXNzaW5nIHN0ZXBcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKGZvciBleGFtcGxlLCBTYXNzKS5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUG9zdENTUyB3aWxsIHRyeSB0byBmaW5kXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZXZpb3VzIG1hcCBhdXRvbWF0aWNhbGx5LFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzbyB5b3UgY291bGQgZGlzYWJsZSBpdCBieVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgZmFsc2VgIHZhbHVlLlxuICogQHByb3BlcnR5IHtib29sZWFufSBtYXAuc291cmNlc0NvbnRlbnQgICAgICAgICAgICBEb2VzIFBvc3RDU1Mgc2hvdWxkIHNldFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGUgb3JpZ2luIGNvbnRlbnQgdG8gbWFwLlxuICogQHByb3BlcnR5IHtzdHJpbmd8ZmFsc2V9IG1hcC5hbm5vdGF0aW9uICAgICAgICAgICBEb2VzIFBvc3RDU1Mgc2hvdWxkIHNldFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbm5vdGF0aW9uIGNvbW1lbnQgdG8gbWFwLlxuICogQHByb3BlcnR5IHtzdHJpbmd9IG1hcC5mcm9tICAgICAgICAgICAgICAgICAgICAgICBPdmVycmlkZSBgZnJvbWAgaW4gbWFw4oCZc1xuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VzYC5cbiAqL1xuIl0sImZpbGUiOiJwcm9jZXNzb3IuanMifQ==
