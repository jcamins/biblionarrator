<?php

class Resources_Style_Controller extends Resource_Controller {

    public $required_columns = array('css');
    public $fk_columns = array('field');
    public $resourceClass = 'Style';

}
