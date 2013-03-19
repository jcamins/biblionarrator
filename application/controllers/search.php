<?php

class Search_Controller extends List_Controller {

    protected $view = 'interface.search';
    protected $viewdata = array (
            'recordToolbarView' => 'components.result-toolbar-common',
            'recordPaneView' => 'components.result-pane-common'
            );

    public function get_index() {
        $query = Input::get('q');
        $this->records = new RecordCollection();
        if (isset($query)) {
            $this->records = $this->records->where(function($dbquery) use ($query) {
                foreach (explode(' ', $query) as $keyword) {
                    $dbquery->where('data', 'LIKE', '%' . $keyword . '%');
                }
            });
        }
        return parent::get_index()->with('query', $query);
    }
}
