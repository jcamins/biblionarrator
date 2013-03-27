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
    public function action_authenticate()
    {
        $email = Input::get('email');
        $password = Input::get('password');
        $new_user = Input::get('new_user', 'off');
        
        $input = array(
            'email' => $email,
            'password' => $password
        );
        
        if( $new_user == 'on' ) {
            
            $rules = array(
                'email' => 'required|email|unique:users',
                'password' => 'required'
            );
            
            $validation = Validator::make($input, $rules);
            
            if( $validation->fails() ) {
                return Redirect::to('home')->with_errors($validation);
            }
            
            try {
                $user = new users();
                $user->email = $email;
                $user->password = Hash::make($password);
                $user->save();
                Auth::login($user);
            
                return Redirect::to('dashboard');
            }  catch( Exception $e ) {
                Session::flash('status_error', 'An error occurred while creating a new account - please try again.');
                return Redirect::to('home');
            }
        } else {
        
            $rules = array(
                'email' => 'required|email|exists:users',
                'password' => 'required'
            );
            
            $validation = Validator::make($input, $rules);
            
            if( $validation->fails() ) {
                return Redirect::to('home')->with_errors($validation);
            }
            
            $credentials = array(
                'username' => $email,
                'password' => $password
            );
            if( Auth::attempt($credentials)) {
                return Redirect::to('dashboard');
            } else {
                Session::flash('status_error', 'Your email or password is invalid - please try again.');
                return Redirect::to('home');
            }
        }
    }

    public function action_login()
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
    
    public function action_logout()
    {
        Auth::logout();
        return Redirect::to('home');
    }
}
