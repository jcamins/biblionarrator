<?php

class Resources_Collection_Controller extends Resource_Controller {

    public $interface_columns = array(
        'name' => array('type' => 'string', 'label' => 'Name', 'required' => true, 'sWidth' => '50%'),
        'security' => array('type' => 'string', 'label' => 'Security', 'required' => true, 'sWidth' => '20%'),
    );

    public $required_columns = array('name', 'security');
    public $resourceClass = 'Collection';

}

