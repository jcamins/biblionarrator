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

class Record_Controller extends Resource_Controller {

    public $required_columns = array('data');
    private static $templatelist = array('interface', 'preview', 'result');
    public $resourceClass = 'Record';

    public function __construct()
    {
        Base_Controller::__construct();
        Asset::add('fieldstyles', 'css/fields.css');
        $this->filter('before', 'auth', array('edit', $this->resourceClass, call_user_func($this->resourceClass . '::find', Input::get('id'))))->except(array('index'));
        $this->filter('before', 'auth', array('view', $this->resourceClass, call_user_func($this->resourceClass . '::find', Input::get('id'))))->only(array('index'));
    }

    public function _interface($record) {
        Asset::add('editor-js', 'js/recordEditor.js');
        Asset::add('shortcut-js', 'js/shortcut.js');
        Asset::add('rangy-js', 'js/rangy/rangy-core.js');
        Asset::add('rangy-class-js', 'js/rangy/rangy-cssclassapplier.js');
        Asset::add('jstree', 'js/jstree/jquery.jstree.js');
        $editor = Authority::can('edit', 'Record', $record);
        return View::make('record.interface')->with('record', $record)->with('recordtype', 'Book')->with('editor', $editor);
    }

    public function get_index($record_id = null, $format = null) {
        $record = Record::find($record_id);
        if (is_null($record)) {
            $record = new Record();
        }
        if (is_null($format) || $format == 'interface') {
            if (isset($record->id)) {
                Breadcrumbs::add('Record ' . $record->id);
            }
            return $this->_interface($record);
        } else if (in_array($format, self::$templatelist)) {
            return View::make('record.' . $format)->with('record', $record)->with('recordtype', 'Book');
        } else {
            return $record->format($format);
        }
    }

    public function get_duplicate($record_id = null) {
        $oldrecord = Record::find($record_id);
        $record = new Record();
        if (isset($oldrecord)) {
            $record->data = $oldrecord->data;
        }
        return $this->_interface($record);
    }
}
