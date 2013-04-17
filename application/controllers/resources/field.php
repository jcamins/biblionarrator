<?php
/* Copyright (c) 2013 C & P Bibliography Services
 *
 * This file is part of Biblionarrator.
 *
 * Biblionarrator is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

class Resources_Field_Controller extends Resource_Controller {

    public $interface_columns = array(
        array('name' => 'schema', 'label' => 'Schema', 'required' => true),
        array('name' => 'field', 'label' => 'Field', 'required' => true),
        array('name' => 'description', 'label' => 'Description', 'required' => false)
    );
    public $required_columns = array('schema', 'field', 'label');
    public $optional_columns = array('description', 'parent', 'primary', 'sortable');
    public $foreign_keys = array('styles');
    public $resourceClass = 'Field';

    protected function _edit($resource) {
        if (is_null($resource)) {
            $resource = new Field;
        }
        Session::put('currentfield', $resource);
        return parent::_admin()->with('field', $resource)->with('id', $resource->id);
    }

    protected function _admin() {
        return $this->_edit(null);
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
