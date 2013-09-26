environment = window.environment;
window.renderer = new WindowRenderer();

environment.renderer.registerHelper('contentFor', function (name, fn, fnElse) {
    return '<div id="contentFor-' + name + '" class="contentFor">' + fn(this) + '</div>';
});

function WindowRenderer() {
    var me = this;

    var urls = {
        results: '/views/partials/results.handlebars',
        resultstable: '/views/partials/resultstable.handlebars',
        facets: '/views/partials/facets.handlebars',
        'field-editor': '/views/partials/admin/field-editor.handlebars'
    };
    var templates = {};

    var display = function(rendered, mountpoint) {
        if (typeof mountpoint === 'object') {
            mountpoint.innerHTML = rendered;
            $(mountpoint).trigger('rendered');
        } else if (typeof mountpoint === 'function') {
            mountpoint(rendered);
        }
    };

    this.load = function(template, callback) {
        if (environment.renderer.registered(template)) {
            callback();
        } else {
            $.ajax({
                url: urls[template]
            }).done(function(hbs) {
                environment.renderer.register(template, hbs);
                if (typeof callback === 'function') {
                    callback();
                }
            });
        }
    };

    this.render = function(data, template, mountpoint) {
        this.load(template, function () {
            display(environment.renderer.render(template, data), mountpoint);
        });
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

    this.registerPartial = function(template, callback) {
        $.ajax({
            url: urls[template]
        }).done(function(data) {
            environment.renderer.registerPartial(template, data);
            if (typeof callback === 'function') {
                callback();
            }
        });
    };
}
