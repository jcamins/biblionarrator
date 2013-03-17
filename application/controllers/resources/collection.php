<?php

class Resources_Collection_Controller extends Resource_Controller {

    public $interface_columns = array(
        array('name' => 'name', 'label' => 'Name', 'required' => true, 'sWidth' => '50%'),
        array('name' => 'security', 'label' => 'Security', 'required' => true, 'sWidth' => '20%'),
    );

    public $required_columns = array('name', 'security');
    public $resourceClass = 'Collection';

}

