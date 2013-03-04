<?php

class RecordCollection extends Laravel\Database\Eloquent\Query
{
    protected $idlist;
    public $autosave = false;
    public $results;

    public function __construct($ids = null) {
        if (gettype($ids) === 'array') {
            $this->idlist = $ids;
        } elseif (in_array(gettype($ids), array('string', 'integer'))) {
            $this->idlist = array($ids);
        } else {
            $this->idlist = array();
        }
        parent::__construct('Record');
        $this->_load_collection();
    }

    public function get_comma_string() {
        return implode(',', $this->idlist);
    }

    public function add($id) {
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
        if (in_array($id, $this->idlist)) {
            $this->idlist = array_diff($this->idlist, array($id));
            if ($this->autosave) {
                $this->save();
            }
            return 'deleted';
        } else {
            return 'notpresent';
        }
    }

    public function size() {
        return count($this->idlist) - 1;
    }

    public function save() {
    }

    protected function _load_collection() {
        if (isset($this->idlist)) {
            $this->where_in('id', $this->idlist);
        }
    }
}
