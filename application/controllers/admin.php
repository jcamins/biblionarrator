<?php

class Admin_Controller extends Base_Controller {

    public $restful = true;

    public function get_fields()
    {
        Asset::add('datatables-js', 'js/jquery.dataTables.min.js');
        Asset::add('datatables-fnreloadajax', 'js/dataTables.fnReloadAjax.js');
        Asset::add('datatables-css', 'css/jquery.dataTables.css');
        Asset::add('jeditable', 'js/jquery.jeditable.min.js');
		return View::make('admin.fields');
    }

    public function get_styles()
    {
        Asset::add('datatables-js', 'js/jquery.dataTables.min.js');
        Asset::add('datatables-css', 'css/jquery.dataTables.css');
		return View::make('admin.styles');
    }

    public function get_styles_ajax($field, $recordtype = null)
    {
        Asset::add('datatables-js', 'js/jquery.dataTables.min.js');
        Asset::add('datatables-fnreloadajax', 'js/dataTables.fnReloadAjax.js');
        Asset::add('datatables-css', 'css/jquery.dataTables.css');
        Asset::add('tagmanager-js', 'js/bootstrap-tagmanager.js');
        Asset::add('tagmanager-css', 'css/bootstrap-tagmanager.css');
        $field = Field::find($field);
        return View::make('admin.styles_ajax')->with('styles', $field->styles)->with('field', $field)->with('recordtype', RecordType::find($recordtype));
    }

    public function post_styles_ajax()
    {
        $obj = json_decode(Input::get('data'));
        $changed_styles = array();
        foreach ($obj->styles as $newstyle) {
            $field_schema = $newstyle->schema;
            $field_field = $newstyle->field;
            $field = Field::where_schema_and_field($field_schema, $field_field)->first();
            if (is_null($field) || is_null($newstyle->css)) continue;
            $style = null;
            if (isset($newstyle->id)) {
                $style = Style::find($newstyle->id);
                if (is_null($style->first())) {
                    $style = new Style;
                }
            } else {
                $style = new Style;
            }
            $style->css = $newstyle->css;
            array_push($changed_styles, $field->styles()->insert($style)->id);
        }
        return json_encode($changed_styles);
    }
}
