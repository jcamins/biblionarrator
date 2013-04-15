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

class User_Settings_Controller extends Settings_Controller {

    protected $model = 'UserSettings';

    public function get_index($variable = null) {
        if (Auth::check()) {
            if (is_null($variable)) {
                return View::make('admin.settings')->with('settings', call_user_func($this->model . '::where_user_id', Auth::user()->id)->get());
            } else {
                $setting = $model::where_variable($variable)->get();
                return Response::json($setting->to_array());
            }
        } else {
            return Redirect::to('home');
        }
    }
}

