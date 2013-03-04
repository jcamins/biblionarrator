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
        Asset::add('bookmarks-js', 'js/bookmarks.js');
		return View::make('interface.bookmarks')->with('records', $bookmarks);
    }

    public function post_add($record = null) {
        $result = array();
        error_log(json_encode(__('bookmarks.addedflash')->get()));
        if (isset($record)) {
            $bookmarks = Session::get('bookmarks');
            if (!preg_match(',' . $record . ',', $bookmarks)) {
                Session::put('bookmarks', $bookmarks . ',' . $record);
                $result['message'] = __('bookmarks.addedflash')->get();
            } else {
                $result['message'] = __('bookmarks.duplicateflash')->get();
            }
        } else {
            $result['message'] = __('bookmarks.errorflash')->get();
        }
        $result['count'] = count(explode(',', Session::get('bookmarks'))) - 1;
        return json_encode($result);
    }

    public function post_delete($record = null) {
        $result = array();
        if (isset($record)) {
            $bookmarks = Session::get('bookmarks');
            $count = null;
            $bookmarks = preg_replace('/,' . $record . '(?![0-9])/', '', $bookmarks, -1, $count);
            if ($count > 0) {
                Session::put('bookmarks', $bookmarks);
                $result['message'] = __('bookmarks.deletedflash')->get();
            }
        } else {
            $result['message'] = __('bookmarks.errorflash')->get();
        }
        $result['count'] = count(explode(',', Session::get('bookmarks'))) - 1;
        return json_encode($result);
    }

}
