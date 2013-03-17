<?php

class Admin_Styles_Controller extends Base_Controller {

    public $restful = true;

    public function get_index()
    {
        Asset::add('datatables-js', 'js/jquery.dataTables.min.js');
        Asset::add('datatables-css', 'css/jquery.dataTables.css');
		return View::make('admin.styles');
    }

    public function get_ajax($field, $recordtype = null)
    {
        Asset::add('datatables-js', 'js/jquery.dataTables.min.js');
        Asset::add('datatables-fnreloadajax', 'js/dataTables.fnReloadAjax.js');
        Asset::add('datatables-css', 'css/jquery.dataTables.css');
        $field = Field::find($field);
        return View::make('admin.styles_ajax')->with('styles', $field->styles)->with('field', $field)->with('recordtype', RecordType::find($recordtype));
    }

    public function post_ajax()
    {
        $obj = json_decode(Input::get('styles'), true);
        $changed_styles = array();
        if (is_null($obj)) {
            return;
        }
        foreach ($obj as $newstyle) {
            $style = null;
            if (isset($newstyle['id'])) {
                $style = Style::find($newstyle['id']);
            }
            if (array_key_exists('delete', $newstyle) && $newstyle['delete'] === 1 && isset($style)) {
                array_push($changed_styles, $style->id);
                $style->recordtypes()->delete();
                $style->delete();
                continue;
            }
            if (is_null($style)) {
                $style = new Style;
            }
            if (isset($newstyle['field_id'])) {
                $field = Field::find($newstyle['field_id']);
            } else {
                $field_schema = $newstyle['schema'];
                $field_field = $newstyle['field'];
                $field = Field::where_schema_and_field($field_schema, $field_field)->first();
            }
            if (is_null($field) || is_null($newstyle['css'])) continue;
            $style->css = $newstyle['css'];
            $field->styles()->save($style);
            array_push($changed_styles, $style->id);
            $style->recordtypes()->sync($newstyle['recordtypes']);
        }
        return json_encode($changed_styles);
    }

}
