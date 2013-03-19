<?php

class Record_Link_Controller extends Base_Controller {

    public $restful = true;

    public function get_select($record) {
        return View::make('ajax.link-select')->with('id', $record);
    }

    public function get_list($record = null) {
        $query = Input::get('q');
        $results = new RecordCollection();
        if (isset($query)) {
            $results = $results->where(function($dbquery) use ($query) {
                foreach (explode(' ', $query) as $keyword) {
                    $dbquery->where('data', 'LIKE', '%' . $keyword . '%');
                }
            });
        }
        return View::make('components.results')->with('records', $results)->with('query', $query);
    }

    public function post_add($record_id, $link_id) {
        $record = Record::find($record_id);
        $record->targets()->attach($link_id);
        return Response::json($record->to_array());
    }
}
