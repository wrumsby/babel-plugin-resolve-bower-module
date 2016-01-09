'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  var cwd = arguments.length <= 0 || arguments[0] === undefined ? process.cwd() : arguments[0];

  var config = (0, _bowerConfig.read)(cwd);
  var directory = _path2.default.join(cwd, config.directory);

  return new Promise(function (resolve, reject) {
    (0, _bowerJson.find)(cwd, function (err, file) {
      if (err) {
        reject(err);
      }

      resolve(file);
    });
  }).then(function (file) {
    return new Promise(function (resolve, reject) {
      (0, _bowerJson.read)(file, function (err, json) {
        if (err) {
          reject(err);
        }

        resolve(json);
      });
    });
  }).then(function (json) {
    // TODO: also need dependencies of dependencies
    var dependencies = (0, _deep.extend)(json.dependencies || {}, json.devDependencies);

    return Promise.all(Object.keys(dependencies).map(function (d) {
      return new Promise(function (resolve, reject) {
        var file = _path2.default.join(directory, d);

        (0, _bowerJson.read)(file, function (err, json) {
          if (err) {
            reject(err);
          }

          var main = Array.isArray(json.main) ? json.main : [json.main];
          var scripts = main.filter(function (m) {
            return m.endsWith('.js');
          });

          if (scripts.length > 0) {
            var mainScript = _path2.default.join(directory, d, scripts[0]);

            resolve({
              name: d,
              main: mainScript
            });
          } else {
            reject('No .js files listed in "main" of ' + d + '\'s Bower metadata.');
          }
        });
      });
    }));
  }).then(function (dependencies) {
    var result = {};

    dependencies.forEach(function (d) {
      return result[d.name] = d.main;
    });

    return result;
  });
};

var _bowerConfig = require('bower-config');

var _bowerJson = require('bower-json');

var _deep = require('deep');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }