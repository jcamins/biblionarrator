<?php

class Admin_Controller extends Base_Controller {

    public $restful = true;

    public function get_fields()
    {
        Asset::add('datatables-js', 'js/jquery.dataTables.min.js');
        Asset::add('datatables-fnreloadajax', 'js/dataTables.fnReloadAjax.js');
        Asset::add('datatables-css', 'css/jquery.dataTables.css');
        Asset::add('jeditable', 'js/jquery.jeditable.min.js');
        Asset::add('tagmanager-js', 'js/bootstrap-tagmanager.js');
        Asset::add('tagmanager-css', 'css/bootstrap-tagmanager.css');
        Asset::add('styleEditor', 'js/styleEditor.js');
		return View::make('admin.fields');
    }


    public function get_collections()
    {
        Asset::add('datatables-js', 'js/jquery.dataTables.min.js');
        Asset::add('datatables-css', 'css/jquery.dataTables.css');
		return View::make('admin.collections');
    }

    public function post_collections()
    {
        $id = Input::get('id');
        $name = Input::get('name');
        $security = Input::get('security');
        $delete = Input::get('delete');
        $collection = null;
        error_log($name);
        if (is_numeric($id)) {
            $collection = Collection::find($id);
        }
        $permitted = false;
        if (isset($collection)) {
            if ($delete) {
                if (Authority::can('delete', 'Collection', $collection)) {
                    $collection->delete();
                    return Redirect::to('collections@admin');
                } else {
                    return Redirect::to('home');
                }
            } else {
                if (Authority::can('edit', 'Collection', $collection)) {
                    $permitted = true;
                }
            }
        } elseif (Authority::can('create', 'Collection', $collection)) {
            $collection = new Collection();
            $permitted = true;
        }
        if ($permitted) {
            $collection->name = $name;
            $collection->security = $security;
            $collection->save();
            Asset::add('datatables-js', 'js/jquery.dataTables.min.js');
            Asset::add('datatables-css', 'css/jquery.dataTables.css');
            return View::make('admin.collections');
        }
        return Redirect::to('home');
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
        $field = Field::find($field);
        return View::make('admin.styles_ajax')->with('styles', $field->styles)->with('field', $field)->with('recordtype', RecordType::find($recordtype));
    }

    public function post_styles_ajax()
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
                $style->delete();
                array_push($changed_styles, $style->id);
                continue;
            }
            if (is_null($style)) {
                $style = new Style;
            }
            $field_schema = $newstyle['schema'];
            $field_field = $newstyle['field'];
            $field = Field::where_schema_and_field($field_schema, $field_field)->first();
            if (is_null($field) || is_null($newstyle['css'])) continue;
            $style->css = $newstyle['css'];
            $field->styles()->save($style);
            array_push($changed_styles, $style->id);
            $style->recordtypes()->sync($newstyle['recordtypes']);
        }
        return json_encode($changed_styles);
    }
}
