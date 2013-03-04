<?php

class Bookmarks_Controller extends Base_Controller {

    public $restful = true;

    protected $viewdata = array (
            'recordToolbarView' => 'components.bookmarksrecordtoolbar',
            'recordPaneView' => 'components.bookmarksrecordpane'
            );

    public function get_index() {
        Asset::add('fieldstyles', 'css/fields.css');
        Asset::add('bookmarks-js', 'js/bookmarks.js');
		return View::make('interface.bookmarks', $this->viewdata)->with('records', Bookmarks::records());
    }

    public function post_add($record = null) {
        return json_encode(
            array(
                'message' => __('bookmarks.' . Bookmarks::add($record) . 'flash')->get(),
                'count' => Bookmarks::size()
            )
        );
    }

    public function get_add($record = null) {
        Bookmarks::add($record);
        return Redirect::to('bookmarks');
    }

    public function post_delete($record = null) {
        return json_encode(
            array(
                'message' => __('bookmarks.' . Bookmarks::delete($record) . 'flash')->get(),
                'count' => Bookmarks::size()
            )
        );
    }

    public function get_delete($record = null) {
        Bookmarks::delete($record);
        return Redirect::to('bookmarks');
    }


}
