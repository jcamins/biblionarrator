var Handlebars = require('handlebars'),
    fs = require('fs'),
    util = require('util');

function MARCRecord(record) {
    this.fields = [ ];
    var ii, jj;
    if (typeof record.fields !== 'undefined') {
        for (ii = 0; ii < record.fields.length; ii++) {
            var f = Object.keys(record.fields[ii])[0];
            var newfield = new MARCField(f, record.fields[ii][f]);
            if (typeof this['f' + f] === 'undefined') {
                this['f' + f] = newfield;
            } else if (util.isArray(this['f' + f])) {
                this['f' + f].push(newfield);
            } else {
                this['f' + f] = [ this['f' + f], newfield ];
            }
            this.fields.push(newfield);
        }
    }
    return this;
}

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
    var marcrec = new MARCRecord (record);
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
        if (el === 'ind1' || el === 'ind2') {
            continue;
        }
        string = string + ' ' + stringify(object[el]);
    }
    return string;
}

var field2index = [
    { re: new RegExp('[17](00|10|11)'), index: 'author', subfields: 'abcdfghijklmnopqrstu' },
    { re: new RegExp('24.'), index: 'title', subfields: 'abcdfghijklmnopqrstuvwxyz' },
    { re: new RegExp('245'), index: 'titleproper', subfields: 'a' },
    { re: new RegExp('245'), index: 'titleremainder', subfields: 'bcdfghijklmnopqrstuvwxyz' },
    { re: new RegExp('246'), index: 'titlevariant', subfields: 'abcdfghijklmnopqrstuvwxyz' },
    { re: new RegExp('250'), index: 'edition', subfields: 'abcdfghijklmnopqrstuvwxyz' },
    { re: new RegExp('260'), index: 'publisher', subfields: 'abcdfghijklmnopqrstuvwxyz' },
    { re: new RegExp('5..'), index: 'note', subfields: 'abcdfghijklmnopqrstuvwxyz' },
    { re: new RegExp('6..'), index: 'subject', subfields: 'abcdfghijklmnopqrstuvwxyz' },
];

module.exports.indexes = function(recorddata) {
    var indexes = { keyword: stringify(recorddata) };
    var record = new MARCRecord(recorddata);
    for (var ii = 0; ii < record.fields.length; ii++) {
        field2index.forEach(function (def) {
            if (record.fields[ii].tag.match(def.re)) {
                indexes[def.index] = indexes[def.index] || '';
                indexes[def.index] = indexes[def.index] + record.fields[ii].string(def.subfields) + ' ';
            }
        });
    }
    return indexes;
};

var field2link = [
    { re: new RegExp('[17](00|10|11)'), link: 'author_e', subfields: 'abcdfghijklmnopqrstu' },
    { re: new RegExp('6..'), link: 'subject_e', subfields: 'abcdfghijklmnopqrstuvwxyz' },
];

module.exports.links = function(recorddata) {
    var links = [ ];
    var record = new MARCRecord(recorddata);
    for (var ii = 0; ii < record.fields.length; ii++) {
        field2link.forEach(function (def) {
            if (record.fields[ii].tag.match(def.re)) {
                links.push({ key: record.fields[ii].string(def.subfields), link: def.link, vivify: true });
            }
        });
    }
    return links;
};

/*jshint unused:false */ /* Not yet implemented */
module.exports.decompile = function(htmldom) {
};
/*jshint unused:true */
