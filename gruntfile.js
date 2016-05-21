module.exports = function(grunt) {
	grunt.initConfig({
		babel: {
			options: {
				sourceMap: false
			},
			build: {
				files: {
					'c/index.js':                 'index.js',
					'c/js/Controls.js':           'js/Controls.js',
					'c/js/File.js':               'js/File.js',
					'c/js/SceneBuilder.js':       'js/SceneBuilder.js',
					'c/lib/AnimatedProperty.js':  'lib/AnimatedProperty.js',
					'c/lib/ContainerNode.js':     'lib/ContainerNode.js',
					'c/lib/Easing.js':            'lib/Easing.js',
					'c/lib/HoldProperty.js':      'lib/HoldProperty.js',
					'c/lib/Key.js':               'lib/Key.js',
					'c/lib/NumericKey.js':        'lib/NumericKey.js',
					'c/lib/NumericProperty.js':   'lib/NumericProperty.js',
					'c/lib/ObjectNode.js':        'lib/ObjectNode.js',
					'c/lib/Property.js':          'lib/Property.js',
					'c/lib/Scene.js':             'lib/Scene.js',
					'c/lib/StaticProperty.js':    'lib/StaticProperty.js',
					'c/lib/Transform.js':         'lib/Transform.js',
					'c/lib/TransformableNode.js': 'lib/TransformableNode.js',
					'c/lib/Viewport.js':          'lib/Viewport.js'
				}
			}
		},
		watch: {
			scripts: {
				files: ['./*.js', 'js/**/*.js', 'lib/**/*.js'],
				tasks: ['babel']
			}
		}
	});
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-babel');
	grunt.registerTask('default', ['babel', 'watch']);
};
