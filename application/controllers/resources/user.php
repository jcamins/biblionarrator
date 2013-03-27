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

class Resources_User_Controller extends Resource_Controller {

    public $interface_columns = array(
        'name' => array('type' => 'string', 'label' => 'Name', 'required' => true, 'sWidth' => '30%'),
        'email' => array('type' => 'string', 'label' => 'Email', 'required' => true, 'sWidth' => '30%'),
        'collection' => array('type' => 'options', 'target' => 'collection_id', 'options' => 'collectionlist', 'label' => 'Collection', 'required' => false, 'sWidth' => '20%'),
    );
    public $required_columns = array('name', 'email', 'collection_id');
    public $hashed_columns = array('password');
    public $fk_columns = array('role');
    public $resourceClass = 'User';

    public function get_security($id) {
        return View::make('ajax.user-security')->with('user', User::find($id));
    }
}

