<?php

class Resources_Field_Controller extends Resource_Controller {

    public $required_columns = array('schema', 'field');
    public $optional_columns = array('description', 'parent');
    public $foreign_keys = array('styles');
    public $resourceClass = 'Field';

}
