var environment = require('../lib/environment'),
    i18next = environment.i18next,
    assets = require('./assets'),
    bookmarks = require('./bookmarks'),
    doc = require('./doc'),
    fields = require('./fields'),
    record = require('./record'),
    media = require('./media'),
    search = require('./search'),
    template = require('./template'),
    auth = require('../lib/auth');

exports.init = function(app) {

    /* Params */
    /*    app.param('record_id', /^\d+$/);
    app.param('target_id', /^\d+$/);
    app.param('media_id', /^\d+$/);
    app.param('filename', /^[-_\w]+$/);*/

    /* Assets */
    app.get('/css/fields.css', assets.fieldscss);
    app.get('/svc/bndb_initializer.js', assets.bndbinitializerjs);

    /* Auth */
    app.get('/auth/login', auth.loginform);
    app.post('/auth/login', auth.localauth, auth.redirect);
    app.get('/auth/logout', auth.logout);
    app.post('/auth/browserid', auth.browseridauth, auth.redirect);

    /* Bookmarks */
    app.get('/bookmarks', bookmarks.view);

    /* Docs */
    app.get('/doc/:filename', doc.get);

    /* Fields */
    app.get('/fields/:schema/:name', auth.can('view', 'field'), fields.get);
    app.post('/fields/:schema/:name', auth.can('edit', 'field'), fields.save);
    app.get('/admin/fields/:schema/:name', auth.can('view', 'field'), fields.admin);
    app.get('/admin/fields', auth.can('view', 'field'), fields.admin);
    app.get('/fields/editor/:schema/:field', auth.can('view', 'field'), fields.editor);
    app.get('/fields/editor', auth.can('view', 'field'), fields.editor);

    /* Record */
    app.get('/record/:record_id/link/select', record.linkselect);
    app.get('/record/:record_id/link/:link_type/:target_id', record.linkadd);
    app.get('/record/:record_id', record.view);
    app.get('/record/:record_id/snippet', record.snippet);
    app.post('/record/:record_id', auth.can('edit', 'record'), record.save);
    app.post('/record/new', auth.can('edit', 'record'), record.save);

    /* Media */
    app.post('/record/:record_id/media', auth.can('edit', 'record'), media.upload);
    app.del('/record/:record_id/media/:filename', auth.can('edit', 'record'), media.del);
    app.get('/media/:record_id/:filename', media.get);

    /* Search */
    app.get('/search', search.view);
    app.get('/map', search.map);

    /* Template */
    app.get('/template', template.get);
    app.get('/template/:template', template.get);

    /* Home */
    app.get('/', home);
    app.get('/about', about);
    app.get('/help', help);
    app.get('/admin', auth.can('edit', 'admin'), admin);
    app.get('/lang/:locale', lang);

    i18next.registerAppHelper(app)
        .serveChangeKeyRoute(app, auth.can('edit', 'translation'))
        .serveRemoveKeyRoute(app, auth.can('edit', 'translation'))
        .serveClientScript(app)
        .serveDynamicResources(app)
        .serveMissingKeyRoute(app);

    i18next.serveWebTranslate(app, {
        path: '/translate',
        i18nextWTOptions: {
            languages: environment.languages || ['en', 'dev'],
            namespaces: ['common', 'help', 'config', 'language'],
            resGetPath: "locales/resources.json?lng=__lng__&ns=__ns__",
            resChangePath: 'locales/change/__lng__/__ns__',
            resRemovePath: 'locales/remove/__lng__/__ns__',
            fallbackLng: "dev",
            dynamicLoad: true
        },
        authenticated: auth.can('edit', 'translation')
    });
};

function home(req, res) {
    res.render('home');
}

function about(req, res) {
    res.render('about');
}

function help(req, res) {
    res.render('help');
}

function admin(req, res) {
    res.render('admin');
}

function lang(req, res) {
    environment.i18next.persistCookie(req, res, req.params.locale);
    res.redirect(req.query.url || req.app.locals.lasturl[0] || '/');
}
