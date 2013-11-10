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
            user: {
                options: {
                    questions: [
                        {
                            config: 'biblionarrator.email',
                            type: 'input',
                            message: 'Username (e-mail address)?',
                            default: 'user@biblionarrator.com',
                            when: function(answers) {
                                return typeof grunt.option('email') === 'undefined';
                            }
                        },
                        {
                            config: 'biblionarrator.name',
                            type: 'input',
                            message: 'Real name?',
                            default: 'John Smith',
                            when: function(answers) {
                                return typeof grunt.option('name') === 'undefined';
                            }
                        },
                        {
                            config: 'biblionarrator.password',
                            type: 'password',
                            message: 'Password (leave blank to autogenerate)?',
                            default: '',
                            when: function(answers) {
                                return typeof grunt.option('password') === 'undefined';
                            }
                        },
                        {
                            config: 'biblionarrator.permissions',
                            type: 'checkbox',
                            message: 'Permissions?',
                            default: [ '*' ],
                            choices: function(answers) {
                                var permissions = require('./src/lib/permissions');
                                var choices = [ { name: 'all (super user)', value: '*' } ];
                                for (var perm in permissions) {
                                    choices.push({ name: permissions[perm], value: perm });
                                }
                                return choices;
                            },
                            when: function(answers) {
                                return typeof grunt.option('permissions') === 'undefined';
                            }
                        }
                    ]
                }
            }
        },
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
    grunt.loadNpmTasks('grunt-configure-biblionarrator');

    grunt.registerTask('passwd', 'Generate system user password', function() {
        var fs = require('fs'),
            bcrypt = require('bcrypt'),
            pwgen = require('password-generator');
        var data = JSON.parse(fs.readFileSync(__dirname + '/config/config.json'));
        var password = grunt.option('password');
        var generated;
        if (typeof password === 'undefined') {
            generated = true;
            password = pwgen(16);
        }
        data.users = data.users || { };
        data.users.systemuser = { '_password': bcrypt.hashSync(password, 10), 'email': 'systemuser', 'permissions': '*' };
        fs.writeFileSync(__dirname + '/config/config.json', JSON.stringify(data, null, 4));
        if (generated) {
            console.log("Your systemuser has been created with the following password: " + password);
            console.log("  If you forget this password you can generate a new password");
            console.log("  for the systemuser by rerunning `grunt passwd`");
        }
    });
    grunt.registerTask('createUser', 'Create User', function () {
        var fs = require('fs'),
            bcrypt = require('bcrypt'),
            pwgen = require('password-generator');
        var data = JSON.parse(fs.readFileSync(__dirname + '/config/config.json'));
        var email = grunt.option('email') || grunt.config('biblionarrator.email');
        var name = grunt.option('name') || grunt.config('biblionarrator.name');
        var password = grunt.option('password') || grunt.config('biblionarrator.password');
        var permissions = grunt.option('permissions') || grunt.config('biblionarrator.permissions');
        if (typeof permissions === 'string') {
            permissions = permissions.split(',');
        }
        var generated;
        if (password === '') {
            generated = true;
            password = pwgen(16);
        }
        data.users = data.users || { };
        data.users[email] = { '_password': bcrypt.hashSync(password, 10), 'email': email, 'name': name };
        if (permissions[0] === '*') {
            data.users[email].permissions = '*';
        } else {
            data.users[email].permission = { };
            permissions.forEach(function (perm) {
                data.users[email].permission[perm] = true;
            });
        }
        fs.writeFileSync(__dirname + '/config/config.json', JSON.stringify(data, null, 4));
        if (generated) {
            console.log("The user " + email + " has been created with the following automatically-generated password: " + password);
        }
    });

    grunt.registerTask('user', [ 'prompt:user', 'createUser' ]);
    grunt.registerTask('build', [ 'browserify', 'uglify', 'less' ]);
    grunt.registerTask('test', [ 'jshint', 'mochaTest', 'jsdoc' ]);
    grunt.registerTask('default', [ 'browserify', 'uglify', 'less', 'jshint', 'mochaTest', 'jsdoc' ]);
    grunt.registerTask('release', [ 'default', 'compress' ]);
    grunt.registerTask('install', [ 'prompt:instance', 'file-creator', 'passwd' ]);
    grunt.registerTask('genuser', [ 'prompt:user', 'createUser' ]);
    grunt.registerTask('config', [ 'configure_biblionarrator' ]);
};
