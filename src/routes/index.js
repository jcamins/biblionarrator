var assets = require('./assets'),
    doc = require('./doc'),
    template = require('./template'),
    fields = require('./fields'),
    record = require('./record'),
    media = require('./media'),
    search = require('./search'),
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
    app.post('/record/:record_id', record.save);
    app.post('/record/new', record.save);

    /* Media */
    app.post('/record/:record_id/media', media.upload);
    app.del('/record/:record_id/media/:media_id', media.del);

    /* Search */
    app.get('/search', search.view);
    app.get('/map', search.map);

    /* Templates */
    app.get('/admin/templates', template.admin);

    /* Home */
    app.get('/', home);
    app.get('/about', about);
    app.get('/admin', admin);
};

function home(req, res) {
    res.render('home');
}

function about(req, res) {
    res.render('about');
}

function admin(req, res) {
    res.render('admin');
}
