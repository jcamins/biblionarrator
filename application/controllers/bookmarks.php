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

class Bookmarks_Controller extends List_Controller {

    protected $view = 'interface.bookmarks';

    protected $viewdata = array (
            'recordToolbarView' => 'components.result-toolbar-common',
            'recordPaneView' => 'components.bookmarksrecordpane'
            );

    public function __construct() {
        $this->records = new Bookmarks();
        $this->records->autosave = true;
        $this->title = 'Bookmarks';
        parent::__construct();
    }

    public function post_add($record = null) {
        return json_encode(
            array(
                'message' => __('bookmarks.' . $this->records->add($record) . 'flash')->get(),
                'count' => $this->records->size()
            )
        );
    }

    public function get_add($record = null) {
        $this->records->add($record);
        return Redirect::to('bookmarks');
    }

    public function post_delete($record = null) {
        return json_encode(
            array(
                'message' => __('bookmarks.' . $this->records->remove($record) . 'flash')->get(),
                'count' => $this->records->size()
            )
        );
    }

    public function get_delete($record = null) {
        $this->records->remove($record);
        return Redirect::to('bookmarks');
    }

    public function get_clear() {
        foreach ($this->records->get() as $record) {
            $this->records->remove($record->id);
        }
        return Redirect::to('bookmarks');
    }

}
