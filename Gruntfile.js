module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        browserify: {
            environment: {
                files: {
                    'public/js/generated/environment.js': ['src/clientjs/environment.js']
                },
                options: {
                    alias: [ 'src/clientjs/environment.js:environment' ]
                }
            },
            dist: {
                files: {
                    'public/js/generated/formathandlers.js': ['src/clientjs/formathandlers.js'],
                    'public/js/generated/templates.js': ['src/clientjs/templates.js'],
                    'public/js/generated/models.js': ['src/clientjs/models.js']
                },
                options: {
                    ignore: [ 'src/lib/environment/index.js' ],
                    external: [ 'environment' ],
                    transform: [ 'brfs' ]
                }
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
                    'src/server.js',
                    'src/routes/*.js',
                    'src/models/*.js',
                    'src/bin/**/*.js',
                    'src/lib/**/*.js',
                    'src/node_modules/**/*.js',
                ],
                options: {
                    "loopfunc": true,
                    "unused": false,
                    "sub": true,
                    "node": true,
                }
            },
            client: {
                src: [
                    'public/js/*.js',
                    'src/clientjs/*.js',
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
                    "sub": true,
                    "expr": true,
                    globals: {
                        module: true,
                        require: true
                    }
                }
            }
        },
        csslint: {
            dist: {
                options: {
                },
                src: [ 'public/css/*.css' ]
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
                    'doc/interfaces/*.js',
                    'src/**/*.js',
                    //'bin/**/*.js',
                    //'tools/**/*.js',
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
        },
        exec: {
            mvn: {
                cmd: 'mvn install'
            }
        }
    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-csslint');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-prompt');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-configure-biblionarrator');

    grunt.registerTask('build', [ 'browserify', 'uglify', 'less' ]);
    grunt.registerTask('install', [ 'exec:mvn', 'build' ]);
    grunt.registerTask('test', [ 'jshint', 'mochaTest', 'jsdoc' ]);
    grunt.registerTask('default', [ 'browserify', 'uglify', 'less', 'jshint', 'mochaTest', 'jsdoc' ]);
    grunt.registerTask('release', [ 'default', 'compress' ]);
};
