<?php

class Record_Controller extends Base_Controller {
    public $restful = true;

    private static $templatelist = array('interface', 'preview', 'result');

    public function get_index($record_id = null, $format = null) {
        Asset::add('fieldstyles', 'css/fields.css');
        $record = Record::find($record_id);
        if (is_null($record)) {
            $record = new Record();
        }
        if (is_null($record->id)) {
            $editor = Authority::can('create', 'Record', $record);
        } else {
            $editor = Authority::can('update', 'Record', $record);
        }
        if ($editor) {
            Asset::add('editor-js', 'js/recordEditor.js');
            Asset::add('shortcut-js', 'js/shortcut.js');
            Asset::add('rangy-js', 'js/rangy/rangy-core.js');
            Asset::add('rangy-class-js', 'js/rangy/rangy-cssclassapplier.js');
        }
        if (is_null($format)) {
            $format = 'interface';
        }
        if (in_array($format, self::$templatelist)) {
            return View::make('record.' . $format)->with('record', $record)->with('recordtype', 'Book')->with('editor', $editor);
        } else {
            return $record->format($format);
        }
    }

    public function post_write($record_id = null) {
        $record = null;
        if ($record_id && $record_id != 'new') {
            $record = Record::find($record_id);
        }
        if (is_null($record)) {
            $record = new Record;
        }
        $record->data = Input::get('data');
        if ((is_null($record_id) || $record_id === 'new') && Authority::can('create', 'Record')) {
            Auth::user()->collection()->first()->records()->save($record);
        } elseif (isset($record->id) && Authority::can('update', 'Record', $record)) {
            $record->save();
        } else {
            return Response::make('Permission denied', 401);
        }
        return json_encode(array('id' => $record->id));
    }

}
