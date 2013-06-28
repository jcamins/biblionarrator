var fs = require('fs');

exports.get = function(req, res) {
    var formats = [{
        name: 'markdown',
        suffix: '.md',
        processor: function(data) {
            var marked = require('marked');
            res.send(marked(data));
        }
    }, {
        name: 'text',
        suffix: '',
        processor: function(data) {
            res.setHeader('Content-Type', 'text/plain');
            res.send(data);
        }
    }, {
        name: 'html',
        suffix: '.html',
        processor: function(data) {
            res.send(data);
        }
    }, {
        name: 'failure',
        last: true,
        processor: function() {
            res.send(404, 'No such document');
        }
    }];
    tryNextFormat(req.params.filename, formats);
};

function tryNextFormat(filename, formats) {
    var format = formats.shift();
    if (format.last) {
        format.processor();
    } else {
        fs.readFile('doc/' + filename + format.suffix, 'utf8', function(err, data) {
            if (err) {
                tryNextFormat(filename, formats);
            } else {
                format.processor(data);
            }
        });
    }
}
