var Handlebars = require('handlebars'),
    MARCRecord = require('../marcrecord'),
    extend = require('extend'),
    util = require('util');

var i18next;

Handlebars.registerHelper('t', function(i18n_key, options) {
    var result = i18next.t(i18n_key, options.hash);

    return new Handlebars.SafeString(result);
});

Handlebars.registerHelper('tr', function(key, options) { 
    var opts = i18next.functions.extend(options.hash, this);
    if (options.fn) opts.defaultValue = options.fn(this);

    var result = i18next.t(key, opts);

    return new Handlebars.SafeString(result);
});



Handlebars.registerHelper('subfordered', function (field, subfields, sep) {
    if (typeof field !== 'undefined' && field !== null) {
        return field.ordered(subfields, sep);
    }
});

Handlebars.registerHelper('subfstring', function (field, subfields, sep) {
    if (typeof field !== 'undefined' && field !== null) {
        return field.string(subfields, sep);
    }
});

Handlebars.registerHelper('subffirst', function (field, subfields) {
    if (typeof field !== 'undefined' && field !== null) {
        return field.first(subfields, 1);
    }
});

Handlebars.registerHelper('field', function (field, options) {
    var ii, string, index = 0;
    if (typeof field === 'undefined' || typeof options === 'undefined') {
        return '';
    } else if (typeof field === 'string') {
        string = '';
        var re = new RegExp('^' + field);
        for (ii = 0; ii < this.fields.length; ii++) {
            if (this.fields[ii].tag.match(re)) {
                field = { index: index++, record: this };
                extend(true, field, this.fields[ii]);
                string = string + options.fn(field);
            }
        }
        return string;
    } else if (util.isArray(field)) {
        string = '';
        for (ii = 0; ii < field.length; ii++) {
            field = { index: index++, record: this };
            extend(true, field, this.fields[ii]);
            string = string + options.fn(field);
        }
    } else {
        field.index = index;
        return options.fn(field);
    }
});

Handlebars.registerHelper('ifsubf', function (subfields, options) {
    var field = this;
    var wanted = subfields.split('');
    if (wanted.some(function (code) { return field.subfields.some(function(subf) { return typeof subf[code] !== 'undefined'; }); })) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

Handlebars.registerHelper('iffield', function (field, options) {
    var hasfield = false;
    if (typeof field === 'string') {
        var re = new RegExp('^' + field);
        for (ii = 0; ii < this.fields.length; ii++) {
            if (this.fields[ii].tag.match(re)) {
                hasfield = true;
                break;
            }
        }
    } else if (field) {
        hasfield = true;
    }
    if (hasfield) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

Handlebars.registerHelper('marc', function (record, options) {
    var marcrec = new MARCRecord (record);
    return options.fn(marcrec);
});

function Renderer(config) {
    var templates = { };

    this.registerHelper = function () {
        Handlebars.registerHelper.apply(Handlebars, arguments);
    };

    this.registerPartial = function () {
        Handlebars.registerPartial.apply(Handlebars, arguments);
    };

    this.register = function (name, template) {
        templates[name] = Handlebars.compile(template);
        return templates[name];
    };

    this.registered = function (name) {
        return (typeof templates[name] === 'function');
    };

    this.render = function (name, data) {
        return templates[name](data);
    };

    i18next = config.i18next;

    return this;
}

module.exports = Renderer;
