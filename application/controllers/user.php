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
class User_Controller extends Base_Controller
{    
    public $restful = true;

    public function get_login()
    {
        if (Auth::guest()) {
            return View::make('home.login');
        } else {
            return Redirect::to('home');
        }
    }

    public function post_login()
    {
        $username = Input::get('username');
        $password = Input::get('password');
        $redirect = Input::get('redirect');
        if (is_null($redirect)) {
            $redirect = 'home';
        }
        $credentials = array(
            'username' => $username,
            'password' => $password
        );
        if( Auth::attempt($credentials)) {
            return Redirect::to($redirect);
        } else {
            Session::flash('status_error', 'Your email or password is invalid - please try again.');
            return Redirect::to($redirect);
        }
    }
    
    public function get_logout()
    {
        Auth::logout();
        return Redirect::to('home');
    }
}
