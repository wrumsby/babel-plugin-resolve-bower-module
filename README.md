# babel-plugin-resolve-bower-module

[![Build Status](https://travis-ci.org/wrumsby/babel-plugin-resolve-bower-module.svg?branch=master)](https://travis-ci.org/wrumsby/babel-plugin-resolve-bower-module)

A Babel plugin to resolve ES6 imports that reference Bower modules.

## Installation

```bash
npm install babel-plugin-resolve-bower-module --save-dev
```

In your `.babelrc` file add the plugin to the `plugins` array:

```json
{
  "plugins": [
    "resolve-bower-module"
  ]
}
```

## How it works

This plugin will look for `import` statements where the `module-name` matches a Bower module that is declared as a `dependency` or a `devDependency` of the project, e.g.

```js
import foo from 'foo';
```

will be transformed to something like

```js
import foo from '../../bower_components/foo/src/index';
```


## Options

If the plugin isn't resolving paths correctly or if your `bower.json` or `.bowerrc` aren't in `process.cwd()` you can pass `cwd` as an option to the plugin, e.g. in `.babelrc` specify

```json
{
  "plugins": [
    ["resolve-bower-module", { "cwd": ".." }]
  ]
}
```
