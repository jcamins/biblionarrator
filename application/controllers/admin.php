<?php

class Admin_Controller extends Base_Controller {

    public function action_fields()
    {
        Asset::add('datatables-js', 'js/jquery.dataTables.min.js');
        Asset::add('datatables-css', 'css/jquery.dataTables.css');
        Asset::add('jeditable', 'js/jquery.jeditable.min.js');
		return View::make('admin.fields');
    }
}
