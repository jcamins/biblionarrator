<?php

class Bookmarks_Controller extends Base_Controller {

    public $restful = true;

    public function get_index() {
        $list = explode(',', Session::get('bookmarks'));
        $bookmarks = null;
        if (isset($list)) {
            $bookmarks = Record::where_in('id', $list)->paginate(10);
        }
        Asset::add('fieldstyles', 'css/fields.css');
		return View::make('interface.bookmarks')->with('records', $bookmarks);
    }

    public function post_add($record = null) {
        $result = array();
        if (isset($record)) {
            $bookmarks = Session::get('bookmarks');
            error_log("Record: " . $record);
            error_log("Bookmarks before: " . $bookmarks);
            if (!preg_match(',' . $record . ',', $bookmarks)) {
                Session::put('bookmarks', $bookmarks . ',' . $record);
                $result['action'] = 'added';
            } else {
                $result['action'] = 'duplicate';
            }
            error_log("Bookmarks after: " . Session::get('bookmarks'));
        } else {
            $result['action'] = 'error';
        }
        $result['count'] = count(explode(',', Session::get('bookmarks'))) - 1;
        return json_encode($result);
    }

}
