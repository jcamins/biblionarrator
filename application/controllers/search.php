<?php

class Search_Controller extends Base_Controller {

    public $restful = true;

    public function get_index() {
        $query = Input::get('q');
        $results = new RecordCollection();
        if (isset($query)) {
            $results = $results->where(function($dbquery) use ($query) {
                foreach (explode(' ', $query) as $keyword) {
                    $dbquery->where('data', 'LIKE', '%' . $keyword . '%');
                }
            });
        }
        Asset::add('fieldstyles', 'css/fields.css');
        Asset::add('bookmarks-js', 'js/bookmarks.js');
		return View::make('interface.search')->with('records', $results)->with('query', $query);
    }
}
