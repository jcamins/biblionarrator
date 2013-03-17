<?php

class Resources_User_Controller extends Resource_Controller {

    public $interface_columns = array(
        array('name' => 'name', 'label' => 'Name', 'required' => true, 'sWidth' => '30%'),
        array('name' => 'email', 'label' => 'Email', 'required' => true, 'sWidth' => '40%'),
    );
    public $required_columns = array('name', 'email');
    public $resourceClass = 'User';

}

