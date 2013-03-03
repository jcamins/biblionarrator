<?php

class Search_Controller extends Base_Controller {

    public $restful = true;

    public function get_index() {
        $query = Input::get('q');
        $results = null;
        if (isset($query)) {
            $results = Record::where(function($dbquery) use ($query) {
                foreach (explode(' ', $query) as $keyword) {
                    $dbquery->where('data', 'LIKE', '%' . $keyword . '%');
                }
            })->get();
        }
        Asset::add('fieldstyles', 'css/fields.css');
		return View::make('interface.search')->with('results', $results)->with('query', $query);
    }
}
