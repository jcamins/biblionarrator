<?php

class ResultRecordCollection extends RecordCollection
{
    public function __construct($ids = null) {
        parent::__construct($ids);
        if (is_null($ids)) {
            $this->where_null('id');
        }
    }

    protected function _update_results() { // We don't have results
        return;
    }
}
