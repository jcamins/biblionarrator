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

class Facet
{

    protected $collection;
    public $name;
    protected $counts;
    protected $selected;

    public function __construct(&$collection, $name) {
        $this->name = $name;
        $this->collection = $collection;
    }

    public function select($value = null) {
        if (isset($value)) {
            $this->selected = $value;
        }
        if (is_null($this->selected)) return;
        if ($this->name === 'recordtype') {
            $recordtype = RecordType::where_name($this->selected)->first();
            if (isset($recordtype)) {
                $this->collection->results->where_recordtype_id($recordtype->id);
            }
        }
    }

    public function counts() {
        $this->counts = array();
        if ($this->name === 'recordtype') {
            $counter = $this->collection->get_query()->table;
            $results = $counter->join('recordtypes', 'records.recordtype_id', '=', 'recordtypes.id')
                ->group_by('records.recordtype_id')
                ->order_by(DB::raw('COUNT(records.recordtype_id)'))
                ->get(array(DB::raw('recordtypes.name AS recordtype'), DB::raw('COUNT(*) AS count')));
            foreach ($results as $res) {
                array_push($this->counts,
                    array('name' => strtolower($res->recordtype),
                          'count' => $res->count,
                          'selected' => (strtolower($res->recordtype) === strtolower($this->selected) ? true : false)
                         ));
            }
        }
        return $this->counts;
    }
}
