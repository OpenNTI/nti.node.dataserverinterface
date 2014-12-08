'use strict';

var webpack = require('webpack');


module.exports = function (config) {
	config.set({
		basePath: '',
		frameworks: ['jasmine'],

		files: [
			'tests/helpers/**/*.js',
			'tests/specs/**/*.js'
		],

		preprocessors: {
			'tests/specs/**/*.js': ['webpack', 'sourcemaps']
		},

		exclude: [],

		port: 8086,
		logLevel: config.LOG_INFO,
		colors: true,
		autoWatch: false,
		// Start these browsers, currently available:
		// - Chrome
		// - ChromeCanary
		// - Firefox
		// - Opera
		// - Safari (only Mac)
		// - PhantomJS
		// - IE (only Windows)
		browsers: ['PhantomJS'],
		reporters: ['progress'],
		captureTimeout: 60000,
		singleRun: true,

		webpackServer: {
			stats: {
				colors: true
			}
		},

		webpack: {
			cache: true,
			debug: true,
			devtool: 'inline-source-map',

			stats: {
				colors: true,
				reasons: true
			},

			node: {
				net: 'empty',
				tls: 'empty'
			},

			resolve: {
				root: __dirname,
				extensions: ['', '.js']
			},

			plugins: [
				new webpack.DefinePlugin({
					SERVER: false
				}),
			],

			module: {
				loaders: [
					{ test: /\.json$/, loader: 'json' }
				]
			}
		}
	});
};
