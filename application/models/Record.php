<?php
class Record extends Eloquent
{
    public static $timestamps = true;

    public function record_type() {
        return $this->belongs_to('RecordType');
    }

}
