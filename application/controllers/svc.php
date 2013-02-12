<?php

class Svc_Controller extends Base_Controller {
    public $restful = true;
    public function get_record() {
        $record = Record::find(Input::get('id'));
        return json_encode($record->to_array());
    }

    public function post_record() {
        $record_id = Input::get('id');
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

    public function get_list() {
    }

    public function get_search() {
    }

    public function get_fields() {
        $fieldlist = array();
        foreach (Field::all() as $field)
        {
            array_push($fieldlist, $field->to_array());
        }

        $fields = array( "iTotalRecords" => count($fieldlist),
        "iTotalDisplayRecords" => count($fieldlist),
        "aaData" => $fieldlist);

        return json_encode($fields);
    }

    public function get_field() {
        $field_id = Input::get('id');
        $field_schema = Input::get('schema');
        $field_field = Input::get('field');
        if (isset($field_id)) {
            $field = Field::find($field_id);
        } else if (isset($field_schema) && isset($field_field)) {
            $field = Field::where_schema($field_schema)->where_field($field_field);
        }
        return json_encode($field->to_array());
    }

    public function post_field() {
        $field_id = Input::get('id');
        $field_schema = Input::get('schema');
        $field_field = Input::get('field');
        $field_description = Input::get('description');
        if ($field_id) {
            $field = Field::find($field_id);
        } else if ($field_schema && $field_field) {
            $field = Field::where_schema($field_schema)->where_field($field_field);
        }
        if (is_null($field->first())) {
            $field = new Field;
        }
        error_log("ID: " . $field_id . "\tSchema: " . $field_schema . "\tField: " . $field_field . "\tDescription: " . $field_description);
        if (isset($field_schema)) $field->schema = $field_schema;
        if (isset($field_field)) $field->field = $field_field;
        if (isset($field_description)) $field->description = $field_description;
        $field->save();
        return json_encode($field);
    }
}

