<?php

class Search_Controller extends List_Controller {

    protected $query;
    protected $view = 'interface.search';
    protected $viewdata = array (
            'recordToolbarView' => 'components.result-toolbar-common',
            'recordPaneView' => 'components.result-pane-common'
            );

    public function __construct() {
        $this->query = Input::get('q');
        $this->records = new RecordCollection();
        if (isset($this->query)) {
            $this->records = $this->records->where(function($dbquery) {
                foreach (explode(' ', $this->query) as $keyword) {
                    $dbquery->where('data', 'LIKE', '%' . $keyword . '%');
                }
            });
        }
        parent::__construct();
    }

    public function get_index() {
        return parent::get_index()->with('query', $this->query);
    }
}
