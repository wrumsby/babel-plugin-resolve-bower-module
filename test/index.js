import * as babel from 'babel-core';
import traverse from 'babel-traverse';
import Plugin from '../src/index';
import { assert } from 'chai';
import deep from 'deep';
import path from 'path';
import fs from 'fs';

const PLUGIN_NAME = 'resolve-bower-module';

function readFile (filename) {
	return fs.readFileSync(`${ __dirname }/fixtures/${ filename }`, 'utf8')
}

function relativise (node) {
	node.value = path.relative(__dirname, node.value);
}

function run (testData) {
	const actualCode = readFile(`${ testData.dir }/actual.js`);
	const expectedCode = readFile(`${ testData.dir }/expected.js`).trim();
	const opts = JSON.parse(readFile(`${ testData.dir }/.babelrc`));

	// Replace bowerrc plugin name with plugin src
	opts.plugins.forEach((plugin, idx) => {
		if (plugin === PLUGIN_NAME) {
			opts.plugins[idx] = Plugin;
		} else if (Array.isArray(plugin) && plugin[0] === PLUGIN_NAME) {
			plugin[0] = Plugin;
		}
	});

	it(testData.description, () => {
		const result = babel.transform(actualCode, opts);
		const resolveModuleSource = result.options.resolveModuleSource;
		const ast = deep.clone(result.ast);

		assert(typeof resolveModuleSource === 'function');

		traverse(ast, {
			enter: function (path) {
				if (path.node.type === 'ImportDeclaration') {
					// we do this because Babel will transform the path into something like
					// '/Users/walter.rumsby/dev/babel-plugin-resolve-module-source/...'
					// and that is going to vary across environments.
					relativise(path.node.source);
				} else if(path.node.type === 'StringLiteral' && path.node.value.indexOf('/') === 0) {
					relativise(path.node);
				}
			}
		});

		const execCode = babel.transformFromAst(ast).code;

		assert.equal(execCode, expectedCode)
	});
}

describe('babel-plugin-resolve-bower-module', () => {
	[
		{
			dir: 'bower-dependencies',
			description: 'Resolves Bower dependencies'
		},
		{
			dir: 'transitive-dependencies',
			description: 'Resolves transitive Bower dependencies'
		}
	].forEach(run);
});
