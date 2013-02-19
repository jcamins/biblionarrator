<?php
class RecordType extends Eloquent
{
    public static $timestamps = true;

    public function record() {
        return $this->has_many('Record');
    }

    public function style() {
        return $this->has_many_and_belongs_to('Style');
    }
}
