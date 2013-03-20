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
		return View::make($this->view, $this->viewdata)->with('records', $this->records);
    }

    public function get_html() {
        $html = '<!DOCTYPE html5 ><html><body>';
        foreach ($this->records->get() as $record) {
            $html .= $record->format('html');
        }
        $html .= '</body></html>';
        $html = preg_replace('/<(\/)?(section|header)>/', '<$1p>', $html);
        libxml_use_internal_errors(true);
        $emogrifier = new Emogrifier($html, View::make('assets.fieldscss')->render());
        return $emogrifier->emogrify();
    }
}
