<?php

class Record_Controller extends Resource_Controller {

    public $required_columns = array('data');
    private static $templatelist = array('interface', 'preview', 'result');
    public $resourceClass = 'Record';

    public function __construct()
    {
        parent::__construct();
        $this->filter('before', 'auth', array('edit', $this->resourceClass, call_user_func($this->resourceClass . '::find', Input::get('id'))))->except(array('index'));
        $this->filter('before', 'auth', array('view', $this->resourceClass, call_user_func($this->resourceClass . '::find', Input::get('id'))))->only(array('index'));
    }

    public function get_index($record_id = null, $format = null) {
        Asset::add('fieldstyles', 'css/fields.css');
        $record = Record::find($record_id);
        if (is_null($record)) {
            $record = new Record();
        }
        $editor = Authority::can('edit', 'Record', $record);
        Asset::add('common-js', 'js/biblionarrator.js');
        Asset::add('editor-js', 'js/recordEditor.js');
        Asset::add('shortcut-js', 'js/shortcut.js');
        Asset::add('rangy-js', 'js/rangy/rangy-core.js');
        Asset::add('rangy-class-js', 'js/rangy/rangy-cssclassapplier.js');
        Asset::add('jstree', 'js/jstree/jquery.jstree.js');
        if (is_null($format)) {
            $format = 'interface';
        }
        if (in_array($format, self::$templatelist)) {
            return View::make('record.' . $format)->with('record', $record)->with('recordtype', 'Book')->with('editor', $editor);
        } else {
            return $record->format($format);
        }
    }
}
