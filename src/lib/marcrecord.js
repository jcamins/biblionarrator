var util = require('util');

function MARCRecord(record) {
    this.fields = [ ];
    var ii;
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

module.exports = MARCRecord;
