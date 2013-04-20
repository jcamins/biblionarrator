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

class RecordCollection extends Laravel\Database\Eloquent\Query
{
    protected $idlist;
    public $autosave = false;
    public $snippet = false;
    public $sorts = array();
    public $results;
    protected $facets = array();

    public function __construct($ids = null) {
        if (gettype($ids) === 'array') {
            $this->idlist = $ids;
        } elseif (in_array(gettype($ids), array('string', 'integer'))) {
            $this->idlist = array($ids);
        }
        parent::__construct('Record');
        if (isset($this->idlist)) {
            $this->_load_collection();
        } else {
            $this->_update_results();
        }
    }

    public function get_comma_string() {
        return implode(',', $this->idlist);
    }

    public function add($id) {
        $this->_update_idlist();
        if (!in_array($id, $this->idlist)) {
            array_push($this->idlist, $id);
            if ($this->autosave) {
                $this->save();
            }
            $this->_load_collection();
            return 'added';
        } else {
            return 'duplicate';
        }
    }

    public function remove($id) {
        $this->_update_idlist();
        if (in_array($id, $this->idlist)) {
            $this->idlist = array_diff($this->idlist, array($id));
            if ($this->autosave) {
                $this->save();
            }
            $this->_load_collection();
            return 'deleted';
        } else {
            return 'notpresent';
        }
    }

    public function size() {
        $this->_update_idlist(true);
        return count($this->idlist);
    }

    public function save() {
    }

    public function snippets($disable = false) {
        $this->snippet = !$disable;
        $this->_update_results();
        return $this;
    }

    public function format($format = 'raw') {
        $output = '';
        foreach ($this->get() as $record) {
            $output .= $record->format($format);
        }
        switch ($format) {
            case 'raw':
                $output = '<records>' . $output . '</records>';
                break;
            
            case 'html4':
                $output = preg_replace('/<(\/)?(section|header)>/', '<$1p>', $output);

            case 'html':
            case 'htmlnolink':
            case 'escaped':
                $output = '<html><body>' . $output . '</body></html>';
                libxml_use_internal_errors(true);
                $emogrifier = new Emogrifier($output, View::make('assets.fieldscss')->render());
                $output = $emogrifier->emogrify();
                break;

            default:
        }
        return $output;
    }

    public function facet($name) {
        $this->_update_idlist();
        foreach ($this->facets as $facet) {
            if ($facet->name === $name) {
                return $facet;
            }
        }
        $facet = new Facet($this, $name);
        array_push($this->facets, $facet);
        return $facet;
    }

    public function drop_facet($name) {
        foreach ($this->facets as $facet) {
            if ($facet->name === $name) {
                $this->facets = array_diff($this->facets, array($facet));
                return;
            }
        }
    }

    public function sort($field) {
        $parts = explode('_', $field);
        if (Field::where_schema_and_field($parts[0], $parts[1])->first()) {
            array_push($this->sorts, $field);
            $this->orderings = array();
            foreach ($this->sorts as $sort) {
                $this->results->order_by(DB::raw("SUBSTRING(data, LOCATE('\"$sort\":', data), LOCATE('}', data, LOCATE('\"$sort\":', data)) - LOCATE('\"$sort\":', data))"));
            }
        }
    }

    public function get_query() {
        if (count($this->idlist) > 0) {
            return Record::where_in('records.id', $this->idlist);
        } else {
            return Record::where_null('records.id');
        }
    }

	public function get($columns = array('*')) {
        if ($this->snippet) {
            $results = array();
            $recs = parent::get($columns);
            foreach ($recs as $record) {
                array_push($results, $record->snippet());
            }
        } else {
            $results = parent::get($columns);
        }
        return $results;
    }

    public function where($column, $operator = null, $value = null, $connector = 'AND') {
        $res = parent::where($column, $operator, $value, $connector);
        $this->_update_results();
        return $res;
    }

    public function where_null($column, $operator = null, $value = null, $connector = 'AND') {
        $res = parent::where_null($column, $operator, $value, $connector);
        $this->_update_results();
        return $res;
    }

    public function where_in($column, $values, $connector = 'AND', $not = false) {
        $res = parent::where_in($column, $values, $connector, $not);
        $this->_update_results();
        return $res;
    }

    protected function _update_results() {
        $this->_update_idlist(true);
        $this->results = new ResultRecordCollection($this->idlist, true);
        if ($this->snippet) {
            $this->results = $this->results->snippets();
        }
        foreach ($this->facets as $facet) {
            $facet->select();
        }
    }

    protected function _load_collection() {
        if (isset($this->idlist)) {
            $this->reset_where();
            if (count($this->idlist) > 0) {
                $this->where_in('id', $this->idlist);
            } else {
                $this->where_null('id');
            }
        }
        $this->_update_idlist(true);
        $this->_update_results();
    }

    protected function _update_idlist($force = false) {
        if (is_null($this->idlist) || $force) {
            $this->idlist = array();
            foreach (parent::get() as $record) {
                array_push($this->idlist, $record->id);
            }
        }
    }
}
