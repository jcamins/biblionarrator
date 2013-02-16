<?php

class Admin_Controller extends Base_Controller {

    public function action_fields()
    {
		return View::make('admin.fields');
    }
}
