<?php

class Primary extends Eloquent
{
    public static $timestamps = true;

    public static $table = 'primaries';

    public function record() {
        return $this->has_one('Record', 'record_id');
    }

}
