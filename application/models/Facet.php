<?php

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
                $this->collection->results->where_recordtype($recordtype->id);
            }
        }
    }

    public function counts() {
        $this->counts = array();
        if ($this->name === 'recordtype') {
            $counter = $this->collection->get_query()->table;
            $results = $counter->join('recordtypes', 'records.recordtype', '=', 'recordtypes.id')
                ->group_by('records.recordtype')
                ->order_by(DB::raw('COUNT(records.recordtype)'))
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
