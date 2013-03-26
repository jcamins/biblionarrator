<?php

class RecordCollection extends Laravel\Database\Eloquent\Query
{
    protected $idlist;
    public $autosave = false;
    public $snippet = false;
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
            $this->results->order_by(DB::raw('ExtractValue(data,\'//' . $parts[0] . '_' . $parts[1] . '\')'));
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

    protected function _update_results() {
        $this->_update_idlist(true);
        $this->results = new ResultRecordCollection($this->idlist, true);
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
