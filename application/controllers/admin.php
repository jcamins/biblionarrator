<?php

class Admin_Controller extends Base_Controller {

    public $restful = true;

    public function get_fields($id = null)
    {
        if (!Authority::can('manage', 'Field')) {
            return Redirect::to('home');
        }
        Asset::add('datatables-js', 'js/jquery.dataTables.min.js');
        Asset::add('datatables-fnreloadajax', 'js/dataTables.fnReloadAjax.js');
        Asset::add('datatables-css', 'css/jquery.dataTables.css');
        Asset::add('jeditable', 'js/jquery.jeditable.min.js');
        Asset::add('datatables-jeditable', 'js/dataTables.jEditable.js');
        Asset::add('jstree', 'js/jstree/jquery.jstree.js');
        Asset::add('tagmanager-js', 'js/bootstrap-tagmanager.js');
        Asset::add('tagmanager-css', 'css/bootstrap-tagmanager.css');
        Asset::add('styleEditor', 'js/styleEditor.js');
        Asset::add('admin-tree-js', 'js/admin-tree.js');
        $columns = array(
            array('name' => 'schema', 'label' => 'Schema', 'required' => true, 'sWidth' => '20%'),
            array('name' => 'field', 'label' => 'Field', 'required' => true, 'sWidth' => '30%'),
            array('name' => 'description', 'label' => 'Description', 'required' => false, 'sWidth' => '40%')
        );
        /*$fieldstree = array();
        foreach (Field::where_null('parent')->get() as $root) {
            array_push($fieldstree, $root);
        }*/
        $field = Field::find($id);
        if (is_null($field)) {
            if (isset($id) && $id !== 'new') {
                return Redirect::to_action('admin@fields', array('new'));
            } else {
                $field = new Field();
            }
        }
        Session::put('currentfield', $field);
		return View::make('admin.fields')->with('resourcetype', 'field')->with('columns', json_encode($columns))->with('field', $field)->with('id', $id);
    }


    public function get_collections()
    {
        if (!Authority::can('manage', 'Collection')) {
            return Redirect::to('home');
        }
        Asset::add('datatables-js', 'js/jquery.dataTables.min.js');
        Asset::add('datatables-css', 'css/jquery.dataTables.css');
        Asset::add('jeditable', 'js/jquery.jeditable.min.js');
        Asset::add('datatables-jeditable', 'js/dataTables.jEditable.js');
        Asset::add('admin-table-js', 'js/admin-table.js');
        $columns = array(
            array('name' => 'name', 'label' => 'Name', 'required' => true, 'sWidth' => '50%'),
            array('name' => 'security', 'label' => 'Security', 'required' => true, 'sWidth' => '20%'),
        );
		return View::make('admin.collections')->with('resourcetype', 'collection')->with('columns', json_encode($columns));
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
                if (Authority::can('update', 'Collection', $collection)) {
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

    public function get_users()
    {
        return View::make('admin.users');
    }
}
