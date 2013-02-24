<?php

class Record_Controller extends Base_Controller {
    public $restful = true;

    public function get_index($record_id = null, $format = null) {
        Asset::add('fieldstyles', 'css/fields.css');
        $record = Record::find($record_id);
        if (is_null($record)) {
            $record = new Record();
        }
        $editor = Authority::can('edit', 'Record', $record);
        if ($editor) {
            Asset::add('editor-js', 'js/recordEditor.js');
            Asset::add('tinymce', 'js/tiny_mce/tiny_mce.js');
        }
        if (is_null($format)) {
            return View::make('interface.record')->with('record', $record)->with('recordtype', 'Book')->with('editor', $editor);
        } else {
            return $record->format($format);
        }
    }

    public function post_write($record_id = null) {
        if ($record_id && $record_id != 'new') {
            $record = Record::find($record_id);
        }
        if (!isset($record)) {
            $record = new Record;
        }
        $record->data = Input::get('data');
        error_log($record->data);
        $record->save();
        return json_encode(array('id' => $record->id));
    }

}
