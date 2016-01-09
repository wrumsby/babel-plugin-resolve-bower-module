'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (_ref) {
  var t = _ref.types;

  return {
    manipulateOptions: function manipulateOptions(opts) {
      var map = setup(opts, this);

      opts.resolveModuleSource = function (source, filename) {
        return resolve(source, map);
      };
    }
  };
};

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _slash = require('slash');

var _slash2 = _interopRequireDefault(_slash);

var _deasync = require('deasync');

var _deasync2 = _interopRequireDefault(_deasync);

var _dependencies = require('./dependencies');

var _dependencies2 = _interopRequireDefault(_dependencies);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @private
 * Sets up the module file resolution mappings for code transforms
 * @return {undefined}
 */
var setup = /*once(*/(0, _deasync2.default)(function () {
  var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var plugin = arguments[1];
  var callback = arguments[2];

  return new Promise(function (resolve, reject) {
    var config = extractConfig(opts, plugin);
    var cwd = config.cwd || '.' || process.cwd();

    resolve((0, _dependencies2.default)(cwd));
  }).then(function (map) {
    callback(null, map);
  }).catch(function (reason) {
    callback(reason);
  });
}) /*)*/;

/**
 * @private
 * Extracts the plugin config from the babel options passed in.
 * @param {Object} opts The babel-supplied options object
 * @param {Function} plugin The plugin instance
 * @return {Object} plugin config
 */

// FIXME: Once breaks tests - figure out how to mock it.
//import once from 'once';
function extractConfig(opts, plugin) {
  for (var i = 0; i < opts.plugins.length; i++) {
    var pluginConfig = opts.plugins[i];

    // The plugins array consists of plugin objects and/or arrays. If a plugin has a config, it will be
    // represented by an array consisting of the plugin object and the config for that plugin.
    if (Array.isArray(pluginConfig) && pluginConfig[0] === plugin && pluginConfig[1]) {
      return pluginConfig[1];
    }
  }

  return {};
}

/**
 * @private
 * Resolves a string value to any existing bower module path
 * @param {String} source module source
 * @param {Object} map map of sources
 * @return {String} resolved module source
 */
function resolve(source, map) {
  var mapped = map[source];

  if (mapped) {
    return (0, _slash2.default)(_path2.default.join(process.cwd(), mapped));
  } else {
    return source;
  }
}