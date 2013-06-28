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

class Record_Link_Controller extends Base_Controller {

    public $restful = true;

    public function get_list($record = null, $field_id = null) {
        $field = Field::find($field_id);
        $query = Input::get('q');
        $results = new RecordCollection();
        if (isset($query)) {
            $results = $results->where(function($dbquery) use ($query) {
                foreach (explode(' ', $query) as $keyword) {
                    $dbquery->where('data', 'LIKE', '%' . $keyword . '%');
                }
            });
        }
        if (isset($field)) {
            $recordtypes = array();
            foreach ($field->links()->get() as $recordtype) {
                array_push($recordtypes, $recordtype->id);
            }
            $results->where_in('recordtype_id', $recordtypes);
        }
        return View::make('components.results')->with('records', $results)->with('query', $query)->with('perpage', 10)->with('paginator', $results->paginate(10));
    }

    public function post_add($record_id, $link_id) {
        $record = Record::find($record_id);
        $record->targets()->attach($link_id);
        return Response::json($record->to_array());
    }
}
