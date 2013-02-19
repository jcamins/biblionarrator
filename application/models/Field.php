<?php
class Field extends Eloquent
{
    public static $timestamps = true;

    public function styles()
    {
        return $this->has_many('Style', 'field_id');
    }
}
