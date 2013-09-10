var Handlebars = require('handlebars'),
    fs = require('fs'),
    util = require('util');

function MARCField(tag, object) {
    this.tag = tag;
    if (typeof object.subfields === 'undefined') {
        this.value = object;
    } else {
        this.subfields = object.subfields;
        for (var jj = 0; jj < object.subfields.length; jj++) {
            var subf = Object.keys(object.subfields[jj])[0];
            if (typeof this[subf] === 'undefined') {
                this[subf] = object.subfields[jj][subf];
            } else if (util.isArray(this[subf])) {
                this[subf].push(object.subfields[jj][subf]);
            } else {
                this[subf] = [ this[subf], object.subfields[jj][subf] ];
            }
        }
    }
    return this;
}

MARCField.prototype.string = function (subfields, sep) {
    if (typeof sep !== 'string') {
        sep = ' ';
    }
    var string = '';
    var usesubf = { };
    subfields.split('').forEach(function (index) {
        usesubf[index] = true;
    });

    if (typeof this.subfields !== 'undefined') {
        for (var ii = 0; ii < this.subfields.length; ii++) {
            if (usesubf[Object.keys(this.subfields[ii])[0]]) {
                string = string + this.subfields[ii][Object.keys(this.subfields[ii])[0]] + sep;
            }
        }
    }
    return string.substring(0, string.length - sep.length);
};

MARCField.prototype.ordered = function (subfields, sep) {
    if (typeof sep !== 'string') {
        sep = ' ';
    }
    var indexes = subfields.split('');
    var string = '';
    for (var ii = 0; ii < indexes.length; ii++) {
        if (typeof this[indexes[ii]] !== 'undefined') {
            if (util.isArray(this[indexes[ii]])) {
                string = string + this[indexes[ii]].join(sep) + sep;
            } else {
                string = string + this[indexes[ii]] + sep;
            }
        }
    }
    return string.substring(0, string.length - sep.length);
};

MARCField.prototype.first = function (subfields, number) {
    var indexes = subfields.split('');
    var string = '';
    for (var ii = 0; ii < indexes.length && number > 0; ii++) {
        if (typeof this[indexes[ii]] !== 'undefined') {
            if (util.isArray(this[indexes[ii]])) {
                string = string + this[indexes[ii]].join(' ') + ' ';
            } else {
                string = string + this[indexes[ii]] + ' ';
            }
            number--;
        }
    }
    return string.trim();
};

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
    if (typeof field === 'undefined' || typeof options === 'undefined') {
        return '';
    } else if (typeof field === 'string') {
        var string = '';
        var re = new RegExp('^' + field);
        for (var ii = 0; ii < this.fields.length; ii++) {
            if (this.fields[ii].tag.match(re)) {
                string = string + options.fn(this.fields[ii]);
            }
        }
        return string;
    } else if (util.isArray(field)) {
        var string = '';
        for (var ii = 0; ii < field.length; ii++) {
            string = string + options.fn(field[ii]);
        }
    } else {
        return options.fn(field);
    }
});

Handlebars.registerHelper('marc', function (record, options) {
    var marcrec = { fields: [ ] };
    var ii, jj;
    for (ii = 0; ii < record.fields.length; ii++) {
        var f = Object.keys(record.fields[ii])[0];
        var newfield = new MARCField(f, record.fields[ii][f]);
        if (typeof marcrec['f' + f] === 'undefined') {
            marcrec['f' + f] = newfield;
        } else if (util.isArray(marcrec['f' + f])) {
            marcrec['f' + f].push(newfield);
        } else {
            marcrec['f' + f] = [ marcrec['f' + f], newfield ];
        }
        marcrec.fields.push(newfield);
    }
    return options.fn(marcrec);
});

var snippettpl = Handlebars.compile(fs.readFileSync(__dirname + '/../../../views/partials/marc21snippet.handlebars', { encoding: 'utf8' }));

module.exports.render = function(recorddata) {
    return snippettpl({ record: recorddata });
};

module.exports.snippet = function(recorddata) {
    return snippettpl({ record: recorddata });
};

function stringify (object) {
    var string = '';
    if (typeof object !== 'object') {
        return object;
    }
    for (var el in object) {
        string = string + ' ' + stringify(object[el]);
    }
    return string;
}

module.exports.indexes = function(recorddata) {
    return {
        keyword: stringify(recorddata)
    };
};


/*jshint unused:false */ /* Not yet implemented */
module.exports.links = function(recorddata) {};

module.exports.decompile = function(htmldom) {
};
/*jshint unused:true */
