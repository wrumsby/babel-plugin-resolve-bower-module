'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (_ref) {
  var t = _ref.types;

  var config = {};

  return {
    visitor: {
      CallExpression: function CallExpression(_ref2) {
        var node = _ref2.node;

        if (!setupComplete) {
          setup();
        }

        var name = node.callee.name;

        if (name === 'require') {
          var args = node.arguments;
          var firstArg = args[0];

          if (args.length === 1 && t.isStringLiteral(firstArg)) {
            var resolvedValue = resolve(firstArg.value, config);
            args[0] = t.stringLiteral(resolvedValue);
          }
        }
      }
    },

    manipulateOptions: function manipulateOptions(opts) {
      if (!setupComplete) {
        config = extractConfig(opts, this);
        setup(config);
      }

      opts.resolveModuleSource = function (source, filename) {
        return resolve(source);
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

var map = {};
var setupComplete = false;

/**
 * @private
 * Sets up the module file resolution mappings for code transforms
 * @return {undefined}
 */
function setup() {
  var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  if (setupComplete) {
    return;
  }

  var done = false;

  var cwd = config.cwd || process.cwd();

  (0, _dependencies2.default)(cwd).then(function (dependencies) {
    map = dependencies;
    done = true;
  }).catch(function (e) {
    console.error(e);
    done = true;
  });

  _deasync2.default.loopWhile(function () {
    return !done;
  });

  setupComplete = done;
}

/**
 * @private
 * Extracts the plugin config from the babel options passed in.
 * @param {Object} opts The babel-supplied options object
 * @param {Function} plugin The plugin instance
 * @return {Object} plugin config
 */
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
 * @return {String} resolved module source
 */
function resolve(source) {
  var mapped = map[source];

  if (mapped) {
    return (0, _slash2.default)(_path2.default.join(process.cwd(), mapped));
  } else {
    return source;
  }
}