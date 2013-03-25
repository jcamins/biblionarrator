<?php

class List_Controller extends Base_Controller {

    public $restful = true;
    protected $records;
    protected $viewdata = array();
    protected $view;

    public function __construct() {
        parent::__construct();
        if (Input::has('recordtype')) {
            $this->records->facet('recordtype')->select(Input::get('recordtype'));
        } else {
            $this->records->drop_facet('recordtype');
        }
        if (Input::has('sort')) {
            $this->records->sort(Input::get('sort'));
        }
    }

    public function get_index() {
        Asset::add('fieldstyles', 'css/fields.css');
        Asset::add('bookmarks-js', 'js/bookmarks.js');
        return View::make($this->view, $this->viewdata)->with('records', $this->records);
    }

    public function get_export($format = null, $type = null) {
        if (isset($format)) {
            if (is_null($type)) {
                $rc = $this->records->results;
            } else if ($type === 'snippet') {
                $rc = $this->records->results->snippets();
            }
            return $rc->format($format);
        }
    }
}
