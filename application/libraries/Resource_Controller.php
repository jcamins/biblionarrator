<?php

class Resource_Controller extends Base_Controller {
    public $restful = true;

    public $interface_columns = array();
    public $required_columns = array();
    public $optional_columns = array();
    public $hashed_columns = array();
    public $fk_columns = array();
    public $resourceClass;

    public function __construct()
    {
        parent::__construct();
        $this->filter('before', 'auth', array('manage', $this->resourceClass, call_user_func($this->resourceClass . '::find', Input::get('id'))));
    }

    public function get_index($id = null) {
        if (isset($id) || $id = Input::get('id')) {
            return $this->_show($id);
        } else {
            return $this->_index();
        }
    }

    public function post_index($id = null) {
        if (isset($id) || $id = Input::get('id')) {
            if (Input::get('delete')) {
                return $this->_delete($id);
            } else {
                return $this->_update($id);
            }
        } else {
            return $this->_store();
        }
    }

    public function delete_index($id = null) {
        if (isset($id) || $id = Input::get('id')) {
            return $this->_delete($id);
        }
    }

    protected function _index() {
        $resourcelist = array();
        if (Auth::user()->has_role('administrator')) {
            $resources = call_user_func($this->resourceClass . '::all');
        } else if ($this->resourceClass === 'Collection') {
            $resources = array(Auth::user()->collection);
        } else {
            $resources = call_user_func(array(Auth::user()->collection, strtolower($this->resourceClass) . 's'))->get();
        }
        foreach ($resources as $resource)
        {
            array_push($resourcelist, $resource->to_array());
        }

        $resources = array( "iTotalRecords" => count($resourcelist),
        "iTotalDisplayRecords" => count($resourcelist),
        "aaData" => $resourcelist);

        return Response::json($resources);
    }

    protected function _store() {
        $id = Input::get('id');
        //if (isset($id) && $id !== '') {
            return $this->_update($id);
        //}
    }

    protected function _show($id) {
        return Response::json(call_user_func($this->resourceClass . '::find', $id));
    }

    protected function _update($id) {
        if (isset($id) && $id !== 'new' && $id !== 'undefined' && $id !== '') {
            $resource = call_user_func($this->resourceClass . '::find', $id);
            if (is_null($resource)) {
                return 'Invalid ID';
            }
        } else {
            $resource = new $this->resourceClass;
        }
        foreach ($this->required_columns as $column) {
            if (Input::has($column)) {
                $resource->set_attribute($column, Input::get($column));
            }
            if (is_null($resource->get_attribute($column))) {
                return 'Missing data for ' . $column;
            }
        }
        foreach ($this->optional_columns as $column) {
            if (Input::has($column)) {
                $resource->set_attribute($column, Input::get($column));
            }
        }
        foreach ($this->hashed_columns as $column) {
            if (Input::has($column)) {
                $resource->set_attribute($column, Hash::make(Input::get($column)));
            }
        }
        foreach ($this->fk_columns as $column) {
            if (Input::has($column)) {
                call_user_func(array(call_user_func(array($resource, $column . 's')), 'delete'));
                call_user_func(array(call_user_func(array($resource, $column . 's')), 'attach'), Input::get($column));
            }
        }
        $resource->save();
        return Response::json($resource);
    }

    protected function _delete($id) {
        $resource = call_user_func($this->resourceClass . '::find', $id);
        if (isset($resource)) {
            foreach ($this->fk_columns as $fk) {
                $fk .= 's';
                $resource->$fk()->delete();
            }
            $resource->delete();
            return Response::json($id);
        }
    }

    public function get_admin() {
        Asset::add('datatables-js', 'js/jquery.dataTables.min.js');
        Asset::add('datatables-css', 'css/jquery.dataTables.css');
        Asset::add('datatables-fnreloadajax', 'js/dataTables.fnReloadAjax.js');
        Asset::add('jeditable', 'js/jquery.jeditable.min.js');
        Asset::add('datatables-jeditable', 'js/dataTables.jEditable.js');
        Asset::add('admin-table-js', 'js/admin-table.js');
        Asset::add('jstree', 'js/jstree/jquery.jstree.js');
        Asset::add('tagmanager-js', 'js/bootstrap-tagmanager.js');
        Asset::add('tagmanager-css', 'css/bootstrap-tagmanager.css');
        Asset::add('styleEditor', 'js/styleEditor.js');
        Asset::add('admin-tree-js', 'js/admin-tree.js');

        return View::make('admin.' . strtolower($this->resourceClass) . 's')->with('resourcetype', strtolower($this->resourceClass))->with('columns', json_encode($this->interface_columns));
    }
}
