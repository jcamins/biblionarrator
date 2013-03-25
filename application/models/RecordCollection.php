<?php

class RecordCollection extends Laravel\Database\Eloquent\Query
{
    protected $idlist;
    public $autosave = false;
    public $results;
    protected $facets = array();

    public function __construct($ids = null, $result = null) {
        if (gettype($ids) === 'array') {
            $this->idlist = $ids;
        } elseif (in_array(gettype($ids), array('string', 'integer'))) {
            $this->idlist = array($ids);
        }
        parent::__construct('Record');
        if (count($this->idlist) > 0) {
            $this->_load_collection();
        }
        if (is_null($result)) {
            $this->_update_results();
        }
    }

    public function get_comma_string() {
        return implode(',', $this->idlist);
    }

    public function add($id) {
        if (is_null($this->idlist)) {
            $this->_update_idlist();
        }
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
        if (is_null($this->idlist)) {
            $this->_update_idlist();
        }
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
        if (is_null($this->idlist)) {
            $this->_update_idlist();
        }
        return count($this->idlist);
    }

    public function save() {
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
        if (is_null($this->idlist)) {
            $this->_update_idlist();
        }
        foreach ($this->facets as $facet) {
            if ($facet->name === $name) {
                return $facet;
            }
        }
        $facet = new Facet($this, $name);
        array_push($this->facets, $facet);
        return $facet;
    }

    public function get_query() {
        if (count($this->idlist) > 0) {
            return Record::where_in('records.id', $this->idlist);
        } else {
            return Record::where_null('records.id');
        }
    }

    protected function _update_results() {
        $this->results = new RecordCollection($this->idlist, true);
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
        $this->_update_idlist();
        $this->_update_results();
    }

    protected function _update_idlist() {
        $this->idlist = array();
        foreach ($this->get() as $record) {
            array_push($this->idlist, $record->id);
        }
    }
}
