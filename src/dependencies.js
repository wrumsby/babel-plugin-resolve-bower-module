import { read as readConfig } from 'bower-config';
import { find, read as readJson } from 'bower-json';
import { extend } from 'deep';
import path from 'path';

export default function (cwd=process.cwd()) {
  const config = readConfig(cwd);
  const directory = path.join(cwd, config.directory);

  return new Promise((resolve, reject) => {
    find(cwd, function (err, file) {
      if (err) {
        reject(err);
      }

      resolve(file);
    });
  }).then(file => {
    return new Promise(function (resolve, reject) {
      readJson(file, function (err, json) {
        if (err) {
          reject(err);
        }

        resolve(json);
      });
    });
  }).then(json => {
    const dependencies = extend(json.dependencies || {}, json.devDependencies);

    return Promise.all(
      Object.keys(dependencies).map(d => new Promise((resolve, reject) => {
        const file = path.join(directory, d);

        readJson(file, function (err, json) {
          if (err) {
            reject(err);
          }

          const main = Array.isArray(json.main) ? json.main : [json.main];
          const scripts = main.filter(m => m.endsWith('.js'));

          if (scripts.length > 0) {
            const mainScript = path.join(directory, d, scripts[0]);

            resolve({
              name: d,
              main: mainScript
            });
          } else {
            reject(`No .js files listed in "main" of ${d}'s Bower metadata.`);
          }
        })
      }))
    );
  }).then(dependencies => {
    const result = {};

    dependencies.forEach(d => result[d.name] = d.main);

    return result;
  });
}
