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

class Resources_Usersettings_Controller extends Resource_Controller {

    public $interface_columns = array(
        'variable' => array('type' => 'string', 'label' => 'Variable', 'required' => true, 'sWidth' => '30%'),
        'value' => array('type' => 'string', 'label' => 'Value', 'required' => true, 'sWidth' => '60%'),
    );

    public $required_columns = array('variable', 'value');
    public $resourceClass = 'UserSettings';
    public $admin_view = 'admin.settings';

    protected function _index() {
        $resourcelist = array();
        $resources = call_user_func($this->resourceClass . '::where', 'user_id', '=', Auth::user()->id)->get();
        foreach ($resources as $resource)
        {
            array_push($resourcelist, $resource->to_array());
        }

        $resources = array( "iTotalRecords" => count($resourcelist),
        "iTotalDisplayRecords" => count($resourcelist),
        "aaData" => $resourcelist);

        return Response::json($resources);
    }
}

