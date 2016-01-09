import path from 'path';
import once from 'once';
import slash from 'slash';
import deasync from 'deasync';
import bower from './dependencies';

/**
 * @private
 * Sets up the module file resolution mappings for code transforms
 * @return {undefined}
 */
const setup = once(deasync(function (opts={}, plugin, callback) {
  return new Promise((resolve, reject) => {
    const config = extractConfig(opts, plugin);
    const cwd = config.cwd || '.' || process.cwd();

    resolve(bower(cwd));
  }).then(map => {
    callback(null, map);
  }).catch(reason => {
    callback(reason);
  });
}));

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
 * @param {Object} map map of sources
 * @return {String} resolved module source
 */
function resolve(source, map) {
  const mapped = map[source];

  if (mapped) {
    return slash(path.join(process.cwd(), mapped));
  } else {
    return source;
  }
}

export default function ({ types: t }) {
  return {
    manipulateOptions(opts) {
      const map = setup(opts, this);

      opts.resolveModuleSource = function (source, filename) {
        return resolve(source, map);
      };
    }
  };
}
