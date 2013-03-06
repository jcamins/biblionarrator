<?php

class Resource_Controller extends Base_Controller {
    public $restful = true;

    public $required_columns = array();
    public $optional_columns = array();
    public $resourceClass;

    public function get_index($id = null) {
        if (isset($id) || $id = Input::get('id')) {
            return $this->_show($id);
        } else {
            return $this->_index();
        }
    }

    public function post_index($id = null) {
        if (isset($id) || $id = Input::get('id')) {
            return $this->_update($id);
        } else {
            return $this->_store();
        }
    }

    protected function _index() {
        $resourcelist = array();
        foreach (call_user_func($this->resourceClass . '::all') as $resource)
        {
            array_push($resourcelist, $resource->to_array());
        }

        $resources = array( "iTotalRecords" => count($resourcelist),
        "iTotalDisplayRecords" => count($resourcelist),
        "aaData" => $resourcelist);

        return json_encode($resources);
    }

    protected function _store() {
        $id = Input::get('id');
        if (isset($id)) {
            return $this->_update($id);
        }
    }

    protected function _show($id) {
        return json_encode(call_user_func($this->resourceClass . '::find', $id)->to_array());
    }

    protected function _update($id) {
        $field_schema = Input::get('schema');
        $field_field = Input::get('field');
        $field_description = Input::get('description');
        $resource = call_user_func($this->resourceClass . '::find', $id);
        if (is_null($resource)) {
            return 'Invalid ID';
        }
        foreach ($this->required_columns as $column) {
            $resource->set_attribute($column, Input::get($column));
            if (is_null($resource->get_attribute($column))) {
                return 'Missing data for ' . $column;
            }
        }
        foreach ($this->optional_columns as $column) {
            $resource->set_attribute($column, Input::get($column));
        }
        $resource->save();
        return json_encode($resource);
    }
}
