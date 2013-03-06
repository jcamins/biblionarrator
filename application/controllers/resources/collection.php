<?php

class Resources_Collection_Controller extends Resource_Controller {

    public $required_columns = array('name', 'security');
    public $optional_columns = array();
    public $resourceClass = 'Collection';

}

