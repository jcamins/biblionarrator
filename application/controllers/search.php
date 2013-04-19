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
        if (Input::has('q')) {
            $this->query = Input::get('q');
            if (isset($this->query)) {
                $query = $this->query;
                $this->records->where('deleted', '=', 0)->where(function($dbquery) use ($query) {
                    $phr = preg_replace('/^"([^"]+)"$/', '$1', $query);
                    if ($phr !== NULL && $phr !== $query) {
                        $dbquery->where('data', 'LIKE', '%' . $phr . '%');
                    } else {
                        foreach (explode(' ', $query) as $keyword) {
                            $dbquery->where('data', 'LIKE', '%' . $keyword . '%');
                        }
                    }
                });
            }
            $this->title = 'Search for "' . $this->query . '"';
        } else {
            $this->records->where('deleted', '=', 0);
            $this->title = 'Search';
        }
        if (Config::get('biblionarrator.private')) {
            if (Auth::check()) {
                $this->records->where('collection_id', '=', Auth::user()->collection_id);
            } else {
                $this->records->where('collection_id', '=', '-1');
            }
        }
        parent::__construct();
        Session::put('query', $this->query);
    }

    public function get_index($format = null, $type = null) {
        return parent::get_index($format, $type);
    }

    public function get_bookmarkall() {
        $bookmarks = new Bookmarks();
        foreach ($this->records->results->get() as $record) {
            $bookmarks->add($record->id);
        }
        $bookmarks->save();
        return Redirect::with_querystring('search');
    }

    public function get_bookmarkpage() {
        $bookmarks = new Bookmarks();
        if (Input::has('perpage')) {
            $perpage = Input::get('perpage');
        } else {
            $perpage = 10;
        }
        foreach ($this->records->results->paginate($perpage)->results as $record) {
            $bookmarks->add($record->id);
        }
        $bookmarks->save();
        return Redirect::with_querystring('search');
    }
}
