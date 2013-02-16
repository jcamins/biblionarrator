<?php

class Record_Controller extends Base_Controller {
    public $restful = true;

    public function get_index($record_id = null) {
        Asset::add('editor-js', 'js/recordEditor.js');
		return View::make('interface.record')->with('recordId', $record_id)->with('fields', Field::all())->with('editor', true);
    }

    public function get_raw($record_id = null) {
        $record = Record::find($record_id);
        return json_encode($record->to_array());
    }

    public function post_write($record_id = null) {
        if ($record_id) {
            $record = Record::find($record_id);
        }
        if (!isset($record)) {
            $record = new Record;
        }
        $record->data = Input::get('data');
        $record->save();
        return json_encode($record->id);
    }

}
