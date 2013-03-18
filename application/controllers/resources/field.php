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

    public function get_styles($id) {
        Asset::add('datatables-js', 'js/jquery.dataTables.min.js');
        Asset::add('datatables-fnreloadajax', 'js/dataTables.fnReloadAjax.js');
        Asset::add('datatables-css', 'css/jquery.dataTables.css');
        $field = Field::find($id);
        return View::make('ajax.styles')->with('styles', $field->styles)->with('field', $field)->with('recordtype', RecordType::find($recordtype));
    }

    public function post_styles($id)
    {
        $obj = json_decode(Input::get('styles'), true);
        $field = Field::find($id);
        $changed_styles = array();
        if (is_null($obj) || is_null($field)) {
            return;
        }
        foreach ($obj as $newstyle) {
            $style = null;
            if (isset($newstyle['id'])) {
                $style = Style::find($newstyle['id']);
            }
            if (is_null($style)) {
                $style = new Style;
            }
            $style->css = $newstyle['css'];
            $field->styles()->save($style);
            array_push($changed_styles, $style->id);
            $style->recordtypes()->sync($newstyle['recordtypes']);
        }
        return json_encode($changed_styles);
    }

    public function get_editor($field = null)
    {
        $field = Field::find($field);
        if (is_null($field)) {
            $field = new Field();
        }
        return View::make('ajax.field-editor')->with('field', $field);
    }

    public function get_tree($field = null) {
        $field = Field::find($field);
        if (is_null($field)) {
            $field = new Field();
        }
        Session::put('currentfield', $field);
        return View::make('ajax.field-tree');
    }
}
