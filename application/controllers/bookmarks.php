<?php

class Bookmarks_Controller extends List_Controller {

    protected $view = 'interface.bookmarks';

    protected $viewdata = array (
            'recordToolbarView' => 'components.result-toolbar-common',
            'recordPaneView' => 'components.bookmarksrecordpane'
            );

    public function __construct() {
        $this->records = new Bookmarks();
        $this->records->autosave = true;
        parent::__construct();
    }

    public function post_add($record = null) {
        return json_encode(
            array(
                'message' => __('bookmarks.' . $this->records->add($record) . 'flash')->get(),
                'count' => $this->records->size()
            )
        );
    }

    public function get_add($record = null) {
        $this->records->add($record);
        return Redirect::to('bookmarks');
    }

    public function post_delete($record = null) {
        return json_encode(
            array(
                'message' => __('bookmarks.' . $this->records->remove($record) . 'flash')->get(),
                'count' => $this->records->size()
            )
        );
    }

    public function get_delete($record = null) {
        $this->records->remove($record);
        return Redirect::to('bookmarks');
    }


}
