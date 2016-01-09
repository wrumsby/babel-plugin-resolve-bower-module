import path from 'path';
import slash from 'slash';
import deasync from 'deasync';
import bowerResolution from './dependencies';

let map = {};
let setupComplete = false;

/**
 * @private
 * Sets up the module file resolution mappings for code transforms
 * @return {undefined}
 */
function setup (config={}) {
  if (setupComplete) {
    return;
  }

  let done = false;

  const cwd = config.cwd || process.cwd();

  bowerResolution(cwd).then(function (dependencies) {
    map = dependencies;
    done = true;
  }).catch(function (e) {
    console.error(e);
    done = true;
  });

  deasync.loopWhile(function () {
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
  for(let i = 0; i < opts.plugins.length; i++) {
    const pluginConfig = opts.plugins[i];

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
  const mapped = map[source];

  if (mapped) {
    return slash(path.join(process.cwd(), mapped));
  } else {
    return source;
  }
}

export default function ({ types: t }) {
  let config = {};

  return {
    visitor: {
      CallExpression({ node }) {
        if(!setupComplete) {
          setup();
        }

        const name = node.callee.name;

        if (name === 'require') {
          const args = node.arguments;
          const firstArg = args[0];

          if (args.length === 1 && t.isStringLiteral(firstArg)) {
            const resolvedValue = resolve(firstArg.value, config);
            args[0] = t.stringLiteral(resolvedValue);
          }
        }
      }
    },

    manipulateOptions(opts) {
      if(!setupComplete) {
        config = extractConfig(opts, this);
        setup(config);
      }

      opts.resolveModuleSource = function (source, filename) {
        return resolve(source);
      }
    }
  };
}
