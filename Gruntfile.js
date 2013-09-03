module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        browserify: {
            dist: {
                files: {
                    'public/js/generated/formathandlers.js': ['src/clientjs/formathandlers.js'],
                    'public/js/generated/templates.js': ['src/clientjs/templates.js'],
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
                    'src/server.js',
                    'src/routes/*.js',
                    'src/models/*.js',
                    'src/bin/**/*.js',
                    'src/lib/**/*.js',
                    'src/node_modules/**/*.js',
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
        prompt: {
            instance: {
                options: {
                    questions: [
                        {
                            config: 'biblionarrator.currentdb',
                            type: 'list',
                            message: 'Which database do you want to use?',
                            default: 'titan',
                            choices: [
                                'titan',
                                'orient',
                                'tinker'
                            ]
                        },
                        /* Titan-specific configuration */
                        {
                            config: 'biblionarrator.keyspace',
                            type: 'input',
                            message: 'What name do you want to use for your Titan keyspace/table?',
                            default: 'biblionarrator',
                            when: function (answers) {
                                return answers['biblionarrator.currentdb'] === 'titan';
                            }
                        },
                        {
                            config: 'biblionarrator.searchbackend',
                            type: 'list',
                            message: 'What search backend do you want to use with Titan??',
                            default: 'esembedded',
                            choices: [ { name: 'Embedded ElasticSearch', value: 'esembedded' },
                                { name: 'Remote ElasticSearch', value: 'esremote' },
                                { name: 'Lucene', value: 'lucene' }
                            ],
                            when: function (answers) {
                                return answers['biblionarrator.currentdb'] === 'titan';
                            }
                        },
                        /* Orient/Tinkergraph-specific configuration */
                        {
                            config: 'biblionarrator.dbpath',
                            type: 'input',
                            message: 'Where do you want to put the database?',
                            default: '/var/lib/biblionarrator',
                            when: function (answers) {
                                return answers['biblionarrator.currentdb'] === 'orient' || answers['biblionarrator.currentdb'] === 'tinker';
                            }
                        },
                        /* Orient-specific configuration */
                        {
                            config: 'biblionarrator.dbuser',
                            type: 'input',
                            message: 'What is the username for your Orient database?',
                            default: 'admin',
                            when: function (answers) {
                                return answers['biblionarrator.currentdb'] === 'orient';
                            }
                        },
                        {
                            config: 'biblionarrator.dbpass',
                            type: 'input',
                            message: 'What is the password for your Orient database?',
                            default: 'admin',
                            when: function (answers) {
                                return answers['biblionarrator.currentdb'] === 'orient';
                            }
                        },
                        /* General configuration */
                        {
                            config: 'biblionarrator.schemas',
                            type: 'checkbox',
                            message: 'Which schemas would you like to pre-configure?',
                            default: [ ],
                            choices: [
                                'eric',
                                'ericthesaurus'
                            ]
                        }
                    ]
                }
            }
        },
        'file-creator': {
            options: {
                openFlags: 'w'
            },
            instance: {
                files: {
                    'config/auth.js': function (fs, fd, done) {
                        var data = require('./config/auth.js.dist');
                        fs.writeSync(fd, 'module.exports = ' + JSON.stringify(data, null, 4) + ';');
                        done();
                    },
                    'config/graphstore.js': function (fs, fd, done) {
                        var data = require('./config/graphstore.js.dist');
                        data.default = grunt.config('biblionarrator.currentdb');
                        switch (data.default) {
                        case 'titan':
                            data.titan['storage.keyspace'] = grunt.config('biblionarrator.keyspace');
                            switch (grunt.config('biblionarrator.searchbackend')) {
                            case 'esembedded':
                                data.titan['storage.index.search.backend'] = 'elasticsearch';
                                data.titan['storage.index.search.directory'] = grunt.config('biblionarrator.ftsdir');
                                data.titan['storage.index.search.client-only'] = false;
                                data.titan['storage.index.search.local-mode'] = true;
                                break;
                            case 'esremote':
                                data.titan['storage.index.search.backend'] = 'elasticsearch';
                                data.titan['storage.index.search.client-only'] = true;
                                data.titan['storage.index.search.hostname'] = '127.0.0.1';
                                break;
                            case 'lucene':
                                data.titan['storage.index.search.backend'] = 'lucene';
                                data.titan['storage.index.search.directory'] = grunt.config('biblionarrator.ftsdir');
                                break;
                            }
                            break;
                        case 'orient':
                            data.orient.path = 'local:' + grunt.config('biblionarrator.dbpath');
                            data.orient.username = grunt.config('biblionarrator.dbuser');
                            data.orient.password = grunt.config('biblionarrator.dbpass');
                            break;
                        case 'tinker':
                            data.tinker.path = grunt.config('biblionarrator.dbpath');
                            break;
                        }
                        fs.writeSync(fd, 'module.exports = ' + JSON.stringify(data, null, 4) + ';');
                        done();
                    },
                    'config/linktypes.js': function (fs, fd, done) {
                        var data = require('./config/linktypes.js.dist');
                        fs.writeSync(fd, 'module.exports = ' + JSON.stringify(data, null, 4) + ';');
                        done();
                    },
                    'config/searchengine.js': function (fs, fd, done) {
                        var data = require('./config/searchengine.js.dist');
                        data.schemas = grunt.config('biblionarrator.schemas');
                        fs.writeSync(fd, 'module.exports = ' + JSON.stringify(data, null, 4) + ';');
                        done();
                    }
                }
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
    grunt.loadNpmTasks('grunt-file-creator');

    grunt.registerTask('build', [ 'browserify', 'uglify', 'less' ]);
    grunt.registerTask('test', [ 'jshint', 'mochaTest', 'jsdoc' ]);
    grunt.registerTask('default', [ 'browserify', 'uglify', 'less', 'jshint', 'mochaTest', 'jsdoc' ]);
    grunt.registerTask('release', [ 'default', 'compress' ]);
    grunt.registerTask('install', [ 'prompt', 'file-creator' ]);
};
