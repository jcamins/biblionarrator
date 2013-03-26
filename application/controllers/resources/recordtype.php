<?php

class Resources_RecordType_Controller extends Resource_Controller {

    public $interface_columns = array(
        'name' => array('type' => 'string', 'label' => 'Name', 'required' => true, 'sWidth' => '30%'),
        'description' => array('type' => 'string', 'label' => 'Description', 'required' => true, 'sWidth' => '60%'),
    );

    public $required_columns = array('name', 'description');
    public $resourceClass = 'RecordType';

}


