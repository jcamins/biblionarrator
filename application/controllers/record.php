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
    public $optional_columns = array('recordtype_id');
    private static $templatelist = array('interface', 'preview', 'result');
    public $resourceClass = 'Record';
    public $safe_delete = true;

    public function __construct()
    {
        Base_Controller::__construct();
        Asset::add('fieldstyles', 'css/fields.css');
        $this->filter('before', 'auth', array('edit', $this->resourceClass, call_user_func($this->resourceClass . '::find', Input::get('id'))))->except(array('index'));
        if (Config::get('biblionarrator.private')) {
            $this->filter('before', 'auth', array('view', $this->resourceClass, call_user_func($this->resourceClass . '::find', Input::get('id'))))->only(array('index'));
        }
    }

    public function get_fromtemplate($template_id = null) {
        $template = Template::find($template_id);
        $record = new Record;
        if (isset($template)) {
            $record->data = $template->data;
            $record->record_type = $template->record_type;
        }
        return $this->_interface($record);
    }

    public function get_index($record_id = null, $type = null) {
        $record = Record::find($record_id);
        if (is_null($record) || $record->deleted) {
            $record = new Record();
        }
        if ($type === 'snippet') {
            $record = $record->snippet();
        }
        $format = $this->_choose_format();
        if ($format == 'interface') {
            if (isset($record->id)) {
                Breadcrumbs::add('Record ' . $record->id);
            }
            return $this->_interface($record);
        } else if (in_array($format, self::$templatelist)) {
            return View::make('record.' . $format)->with('record', $record);
        } else {
            return $record->format($format);
        }
    }

    public function get_duplicate($record_id = null) {
        $record = Record::find($record_id);
        unset($record->id);
        return $this->_interface($record);
    }

    public function get_delete($record_id = null) {
        $resource = Record::find($record_id);
        if (isset($resource)) {
            $this->_delete($resource);
            return Redirect::to('/record/new');
        }
    }
}
