<?php

class Record_Controller extends Base_Controller {
    public $restful = true;

    public function get_index($record_id = null) {
        $editor = true;
        if ($editor) {
            Asset::add('editor-js', 'js/recordEditor.js');
            Asset::add('tinymce', 'js/tiny_mce/tiny_mce.js');
        }
		return View::make('interface.record')->with('recordId', $record_id)->with('record', Record_Controller::get_raw($record_id))->with('fields', Field::all())->with('editor', $editor);
    }

    public function get_raw($record_id = null) {
        $record = Record::find($record_id);
        if ($record) {
            return $record->data;
        }
        return '';
    }

    public function get_html($record_id = null) {
        $record = Record::find($record_id);
        if ($record) {
            return Record_Controller::_crosswalkRecordXml($record->data, 'raw2html.xsl');
        }
        return '';
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
        return json_encode(array('id' => $record->id));
    }

    public function _crosswalkRecordXml($record, $stylesheet) {
        $xp = new XsltProcessor();
        $xsl = new DomDocument;
        $xsl->load('public/xsl/' . $stylesheet);
        $xp->importStylesheet($xsl);
        $xml = new DomDocument;
        $xml->loadXML($record);
        return $xp->transformToXML($xml);
    }

}
