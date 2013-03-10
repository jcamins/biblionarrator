<?php

class Admin_Ajax_Controller extends Base_Controller {

    public $restful = true;

    public function get_fieldeditor($field = null, $recordtype = null)
    {
        $field = Field::find($field);
        if (is_null($field)) {
            $field = new Field();
        }
        return View::make('components.fieldeditor')->with('field', $field);
    }

    public function get_fieldtree($field = null) {
        $field = Field::find($field);
        if (is_null($field)) {
            $field = new Field();
        }
        Session::put('currentfield', $field);
        return View::make('components.fieldtree');
    }

}
