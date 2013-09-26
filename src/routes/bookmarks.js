
exports.view = function(req, res) {
    res.render('list/interface', { initjs: 'window.bookmarks.show();' });
};
