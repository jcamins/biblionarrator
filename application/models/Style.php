<?php
class Style extends Eloquent
{
    public static $timestamps = true;

    public function field() {
        return $this->belongs_to('Field', 'field_id');
    }

    public function recordtypes() {
        return $this->has_many_and_belongs_to('RecordType');
    }
}
