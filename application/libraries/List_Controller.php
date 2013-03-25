<?php

class List_Controller extends Base_Controller {

    public $restful = true;
    protected $records;
    protected $viewdata = array();
    protected $view;

    public function __construct() {
        parent::__construct();
    }

    public function get_index() {
        Asset::add('fieldstyles', 'css/fields.css');
        Asset::add('bookmarks-js', 'js/bookmarks.js');
        if (Input::has('recordtype')) {
            $this->records->facet('recordtype')->select(Input::get('recordtype'));
        }
        return View::make($this->view, $this->viewdata)->with('records', $this->records);
    }

    public function get_export($format = null) {
        if (isset($format)) {
            return $this->records->format($format);
        }
    }
}
