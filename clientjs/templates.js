window.Handlebars = require('handlebars');

window.renderer = new Renderer();

function Renderer() {
    var me = this;

    var urls = {
        results: '/views/partials/results.handlebars'
    };
    var templates = { };

    this.preload = function (template) {
        me.render({ }, template);
    };

    this.render = function (data, template, mountpoint) {
        if (templates[template]) {
            display(data, template, mountpoint);
        } else {
            $.ajax({
                url: urls[template]
            }).done(function (hbs) {
                templates[template] = window.Handlebars.compile(hbs);
                display(data, template, mountpoint);
            });
        }
    };

    this.renderRemote = function (url, template, mountpoint) {
        $.ajax({
            url: url,
            accepts: 'application/json',
            dataType: 'json'
        }).done(function (data) {
            me.render(data, template, mountpoint);
        }).error(function (jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        });
    };
};

function display (data, template, mountpoint) {
    if (typeof mountpoint === 'object') {
        mountpoint.innerHTML += templates[template](data);
    }
}
