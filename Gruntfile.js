'use strict';

module.exports = function(grunt) {
	// Let *load-grunt-tasks* require everything
	require('load-grunt-tasks')(grunt);

	grunt.initConfig({

		karma: {
            unit: {
                configFile: 'karma.conf.js'
            }
        },


		jshint: {
	        options: {
				jshintrc: true,
	            reporter: require('jshint-log-reporter')
			},
	        files: [
				'interface/**/*.js',
				'models/**/*.js',
				'session/**/*.js',
				'stores/**/*.js',
				'utils/**/*.js',
				'index.js',
			]
	    }
	});

	//grunt.registerTask('docs',['jsdoc']);
	grunt.registerTask('test', ['karma']);
	grunt.registerTask('default', ['jshint']);

};
