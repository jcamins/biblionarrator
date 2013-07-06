var assets = require('./assets'),
    doc = require('./doc'),
    record = require('./record'),
    media = require('./media');

exports.init = function (app) {

    /* Params */
    app.param('record_id', /^\d+$/);
    app.param('target_id', /^\d+$/);
    app.param('media_id', /^\d+$/);
    app.param('filename', /^[-_\w]+$/);

    /* Assets */
    app.get('/css/fields.css', assets.fieldscss);
    app.get('/svc/bndb_initializer.js', assets.bndbinitializerjs);

    /* Docs */
    app.get('/doc/:filename', doc.get);

    /* Record */
    app.get('/record/:record_id/link/select', record.linkselect);
    app.get('/record/:record_id/link/add/:target_id', record.linkadd);
    app.get('/record/:record_id', record.view);

    /* Media */
    app.post('/record/:record_id/media', media.upload);
    app.del('/record/:record_id/media/:media_id', media.del);
};
