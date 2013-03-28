<?php
/* Copyright (c) 2013 C & P Bibliography Services
 *
 * This file is part of Biblionarrator.
 *
 * Biblionarrator is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

class Search_Controller extends List_Controller {

    protected $query;
    protected $view = 'interface.search';
    protected $viewdata = array (
            'recordToolbarView' => 'components.result-toolbar-common',
            'recordPaneView' => 'components.result-pane-common'
            );

    public function __construct() {
        $this->records = new RecordCollection();
        if (Input::get('q') != '/' . URI::current()) {
            $this->query = Input::get('q');
            if (isset($this->query)) {
                $query = $this->query;
                $this->records = $this->records->where(function($dbquery) use ($query) {
                    foreach (explode(' ', $query) as $keyword) {
                        $dbquery->where('data', 'LIKE', '%' . $keyword . '%');
                    }
                });
            }
        }
        if (Config::get('biblionarrator.private')) {
            if (Auth::check()) {
                $this->records->where('collection_id', '=', Auth::user()->collection_id);
            } else {
                $this->records->where_null('collection_id');
            }
        }
        parent::__construct();
    }

    public function get_index() {
        return parent::get_index()->with('query', $this->query);
    }
}
