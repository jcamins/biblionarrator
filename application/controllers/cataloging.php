<?php

class Cataloging_Controller extends Base_Controller {

    public function action_editor()
    {
		return View::make('cataloging.editor');
    }

    public function action_fields()
    {
		return View::make('cataloging.fields');
    }
}
