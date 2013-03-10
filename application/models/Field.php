<?php
class Field extends Eloquent
{
    public static $timestamps = true;

    public static function roots()
    {
        return Field::where_null('parent');
    }

    public function styles()
    {
        return $this->has_many('Style', 'field_id');
    }

    public function parent()
    {
        return $this->belongs_to('Field', 'parent');
    }

    public function children()
    {
        return $this->has_many('Field', 'parent');
    }

    public function links()
    {
        return $this->has_many_and_belongs_to('RecordType', 'field_links');
    }
}
