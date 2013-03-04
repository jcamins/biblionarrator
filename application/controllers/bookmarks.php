<?php

class Bookmarks_Controller extends Base_Controller {

    public $restful = true;
    
    protected $bookmarks;

    public function __construct() {
        parent::__construct();
        $this->bookmarks = new Bookmarks();
        $this->bookmarks->autosave = true;
    }

    protected $viewdata = array (
            'recordToolbarView' => 'components.bookmarksrecordtoolbar',
            'recordPaneView' => 'components.bookmarksrecordpane'
            );

    public function get_index() {
        Asset::add('fieldstyles', 'css/fields.css');
        Asset::add('bookmarks-js', 'js/bookmarks.js');
		return View::make('interface.bookmarks', $this->viewdata)->with('records', $this->bookmarks);
    }

    public function post_add($record = null) {
        return json_encode(
            array(
                'message' => __('bookmarks.' . $this->bookmarks->add($record) . 'flash')->get(),
                'count' => $this->bookmarks->size()
            )
        );
    }

    public function get_add($record = null) {
        $this->bookmarks->add($record);
        return Redirect::to('bookmarks');
    }

    public function post_delete($record = null) {
        return json_encode(
            array(
                'message' => __('bookmarks.' . $this->bookmarks->remove($record) . 'flash')->get(),
                'count' => $this->bookmarks->size()
            )
        );
    }

    public function get_delete($record = null) {
        $this->bookmarks->remove($record);
        return Redirect::to('bookmarks');
    }


}
