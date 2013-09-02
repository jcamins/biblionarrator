window.Handlebars = require('handlebars');

window.renderer = new Renderer();

function Renderer() {
    var me = this;

    window.Handlebars.registerHelper('contentFor', function (name, fn, fnElse) {
        return '<div id="contentFor-' + name + '" class="contentFor">' + fn(this) + '</div>';
    });

    var urls = {
        results: '/views/partials/results.handlebars',
        resultstable: '/views/partials/resultstable.handlebars',
        facets: '/views/partials/facets.handlebars',
        'field-editor': '/views/partials/admin/field-editor.handlebars'
    };
    var templates = {};

    var display = function(data, template, mountpoint) {
        if (typeof mountpoint === 'object') {
            mountpoint.innerHTML = templates[template](data);
            $(mountpoint).trigger('rendered');
        } else if (typeof mountpoint === 'function') {
            mountpoint(templates[template](data));
        }
    };

    this.preload = function(template) {
        me.render({}, template);
    };

    this.render = function(data, template, mountpoint) {
        if (templates[template]) {
            display(data, template, mountpoint);
        } else {
            $.ajax({
                url: urls[template]
            }).done(function(hbs) {
                templates[template] = window.Handlebars.compile(hbs);
                display(data, template, mountpoint);
            });
        }
    };

    this.renderRemote = function(url, template, mountpoint) {
        $.ajax({
            url: url,
            accept: { json: 'application/json' },
            dataType: 'json'
        }).done(function(data) {
            me.render(data, template, mountpoint);
        }).error(function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        });
    };
}
