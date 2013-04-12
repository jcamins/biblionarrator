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

class List_Controller extends Base_Controller {

    public $restful = true;
    protected $title = null;
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
        $ii = 0;
        while (Input::has("sort.$ii")) {
            $this->records->sort(Input::get("sort.$ii"));
            $ii++;
        }
    }

    public function get_index() {
        Asset::add('fieldstyles', 'css/fields.css');
        Asset::add('bookmarks-js', 'js/bookmarks.js');
        if (Input::has('perpage')) {
            $perpage = Input::get('perpage');
        } else {
            $perpage = 10;
        }
        Breadcrumbs::add($this->title);
        return View::make($this->view, $this->viewdata)->with('records', $this->records)->with('perpage', $perpage)->with('paginator', $this->records->results->paginate($perpage));
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
