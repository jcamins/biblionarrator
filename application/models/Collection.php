<?php
class Collection extends Eloquent
{
    public static $timestamps = true;

    public function records() {
        return $this->has_many('Record', 'collection_id');
    }

    public function users() {
        return $this->has_many('User', 'collection_id');
    }
}
