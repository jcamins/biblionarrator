<?php

class Bookmarks extends RecordCollection
{
    public function __construct() {
        parent::__construct(explode(',', Session::get('bookmarks')));
    }

    public function save() {
        Session::put('bookmarks', $this->get_comma_string());
    }
}
