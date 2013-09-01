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
        uglify: {
            dist: {
                files: {
                    'public/js/generated/formathandlers.min.js': [ 'public/js/generated/formathandlers.js' ],
                    'public/js/generated/templates.min.js': [ 'public/js/generated/templates.js' ],
                }
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
            server: {
                src: [
                    'server.js',
                    'routes/*.js',
                    'models/*.js',
                    'bin/**/*.js',
                    'lib/**/*.js',
                ],
                options: {
                    "loopfunc": true,
                    "unused": true,
                    "sub": true,
                    "node": true,
                }
            },
            client: {
                src: [
                    'public/js/*.js',
                    'clientjs/*.js',
                ],
                options: {
                    "loopfunc": true,
                    "sub": true,
                    "es3": true,
                    globals: {
                        module: true,
                        window: true,
                        require: true
                    }
                }
            },
            tests: {
                src: [
                    'tests/*.js'
                ],
                options: {
                    "loopfunc": true,
                    "unused": true,
                    "sub": true,
                    "expr": true,
                    globals: {
                        module: true,
                        require: true
                    }
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
        },
        jsdoc: {
            dist: {
                src: [
                    'lib/**/*.js',
                    'models/*.js',
                    'routes/*.js',
                    'bin/**/*.js',
                    'tests/*.js'
                ],
                options: {
                    destination: 'doc/api'
                }
            }
        },
        compress: {
            dist: {
                options: {
                    archive: '../biblionarrator-<%= pkg.version %>.tar.gz',
                    mode: 'tgz'
                },
                src: [ './**' ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-contrib-compress');

    grunt.registerTask('build', [ 'browserify', 'uglify', 'less' ])
    grunt.registerTask('test', [ 'jshint', 'mochaTest', 'jsdoc' ])
    grunt.registerTask('default', [ 'browserify', 'uglify', 'less', 'jshint', 'mochaTest', 'jsdoc' ]);
    grunt.registerTask('release', [ 'default', 'compress' ])
};
