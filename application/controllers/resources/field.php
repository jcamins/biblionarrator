<?php

class Resources_Field_Controller extends Resource_Controller {

    public $interface_columns = array(
        array('name' => 'schema', 'label' => 'Schema', 'required' => true, 'sWidth' => '20%'),
        array('name' => 'field', 'label' => 'Field', 'required' => true, 'sWidth' => '30%'),
        array('name' => 'description', 'label' => 'Description', 'required' => false, 'sWidth' => '40%')
    );
    public $required_columns = array('schema', 'field');
    public $optional_columns = array('description', 'parent', 'primary');
    public $foreign_keys = array('styles');
    public $resourceClass = 'Field';

    public function get_admin($id = null) {
        $field = Field::find($id);
        if (is_null($field)) {
            if (isset($id) && $id !== 'new') {
                return Redirect::to_action('admin@fields', array('new'));
            } else {
                $field = new Field();
            }
        }
        Session::put('currentfield', $field);
		return parent::get_admin()->with('field', $field)->with('id', $id);
    }
}
