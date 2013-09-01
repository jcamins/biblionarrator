module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        browserify: {
            dist: {
                files: {
                    'public/js/generated/formathandlers.js': ['clientjs/formathandlers.js'],
                    'public/js/generated/templates.js': ['clientjs/templates.js'],
                },
                options: { }
            }
        },
        less: {
            dist: {
                files: {
                    'public/css/style.css': 'public/css/style.less',
                }
            },
            dist_min: {
                files: {
                    'public/css/style.min.css': 'public/css/style.less',
                },
                options: { yuicompress: true }
            },
        },
        jshint: {
            files: [
                'server.js',
                'routes/*.js',
                'models/*.js',
                'bin/**/*.js',
                'lib/**/*.js',
                'tests/*.js'
            ],
            options: {
                "loopfunc": true,
                "unused": true,
                "sub": true,
                global: {
                    module: true
                }
            }
        },
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                    require: 'tests/coverage/blanket.js'
                },
                src: [
                    'tests/*.js',
                ]
            },
            coverage: {
                options: {
                    reporter: 'html-cov',
                    quiet: true,
                    captureFile: 'coverage.html'
                },
                src: [ 'tests/*.js' ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');

    grunt.registerTask('test', [ 'mochaTest' ])
    grunt.registerTask('default', [ 'browserify', 'less', 'mochaTest' ]);
};
