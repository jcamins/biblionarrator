<?php

class Bookmarks_Controller extends List_Controller {

    protected $view = 'interface.bookmarks';

    protected $viewdata = array (
            'recordToolbarView' => 'components.result-toolbar-common',
            'recordPaneView' => 'components.bookmarksrecordpane'
            );

    public function __construct() {
        parent::__construct();
        $this->records = new Bookmarks();
        $this->records->autosave = true;
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
