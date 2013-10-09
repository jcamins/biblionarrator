var options = require('../../src/lib/cmd'),
    environment = require('../../src/lib/environment');

var fs = require('fs'),
    path = require('path'),
    readdirp = require('readdirp'),
    extend = require('extend');

var keys = { };

environment.renderer.registerHelper('t', function(i18n_key) {
    keys[i18n_key] = '';

    return '';
});

environment.renderer.registerHelper('tr', function(i18n_key, options) {
    var defaultValue = ''
    if (options.fn) defaultValue = options.fn({ });

    keys[i18n_key] = defaultValue;

    return '';
});

environment.renderer.registerHelper('block', function () {
    return '';
});

function registerBlockHelper(name) {
    environment.renderer.registerHelper(name, function (input, options) {
        if (options.fn) options.fn({ });
        if (options.inverse) options.inverse({ });
        return '';
    });
}

['if', 'contentFor', 'each', 'field', 'ifsubf', 'iffield'].forEach(registerBlockHelper);
var files = [ ];
readdirp({ root: path.resolve(__dirname, '../../views'), fileFilter: '*.handlebars' }, function (err, res) {
    res.files.forEach(function (file) {
        files.push(file.name);
        var data = fs.readFileSync(file.fullPath, { encoding: 'utf8' });
            
        if (file.parentDir.indexOf('partials') > -1) {
            environment.renderer.registerPartial(file.path.replace('.handlebars', '').replace('partials/', ''), data);
        }
        environment.renderer.register(file.name, data);
    });
    files.forEach(function (file) {
        try {
            environment.renderer.render(file, { });
        } catch (e) {
        }
    });
    var locale = { };
    var newlocale = { };
    for (var key in keys) {
        var parts = key.split(/\./);
        var value = keys[key].replace(/\s+/g, ' ');
        var part;
        while ((part = parts.pop())) {
            var temp = { };
            temp[part] = value;
            value = temp;
        }
        extend(true, newlocale, value);
    }
    try {
        var data = fs.readFileSync(path.resolve(__dirname, '../../locales', 'en', 'ns.common.json'), { encoding: 'utf8' });
        locale = JSON.parse(data);
    } catch (e) {
    }
    extend(true, newlocale, locale);
    fs.writeFileSync(path.resolve(__dirname, '../../locales', 'en', 'ns.common.json'), JSON.stringify(newlocale, null, 4));
    process.exit();
});
