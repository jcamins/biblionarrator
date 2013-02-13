<?php

class Cataloging_Controller extends Base_Controller {

    public function action_editor()
    {
		return View::make('cataloging.editor')->with('fields', Field::all());
    }

    public function action_fields()
    {
		return View::make('cataloging.fields');
    }
}
