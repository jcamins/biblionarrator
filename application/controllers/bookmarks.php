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

    public function put_index($record = null) {
        return $this->_flash($this->records->add($record));
    }

    public function delete_index($record = null) {
        if (isset($record)) {
            $message = $this->records->remove($record);
        } else {
            $this->_empty();
            $message = 'cleared';
        }
        return $this->_flash($message);
    }

    /* The following three routines are for non-Javascript fallback and
       should not be considered as part of the Biblionarrator API */
    public function get_add($record = null) {
        $this->records->add($record);
        return Redirect::to('bookmarks');
    }

    public function get_delete($record = null) {
        $this->records->remove($record);
        return Redirect::to('bookmarks');
    }

    public function get_clear() {
        $this->_empty();
        return Redirect::to('bookmarks');
    }

    protected function _empty() {
        foreach ($this->records->get() as $record) {
            $this->records->remove($record->id);
        }
    }

    protected function _flash($message) {
        return json_encode(
            array(
                'message' => __('bookmarks.' . $message . 'flash')->get(),
                'count' => $this->records->size()
            )
        );
    }

}
