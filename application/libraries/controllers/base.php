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


class Base_Controller extends Controller {

    public function __construct()
    {
        //Assets
        Asset::add('jquery', 'lib/js/jquery.js');
        Asset::add('jquery-history', 'lib/js/jquery.history.js');
        Asset::add('biblionarrator-js', 'js/biblionarrator.js');
        Asset::add('bootstrap-js', 'lib/bootstrap/js/bootstrap.min.js');
        Asset::add('typeahed-js', 'lib/js/typeahead.js');
        Asset::add('bootstrap-css', 'lib/bootstrap/css/bootstrap.min.css');
        Asset::add('typeahead-css', 'css/typeahead.js-bootstrap.css');
        Asset::add('bootstrap-css-responsive', 'lib/bootstrap/css/bootstrap-responsive.min.css', 'bootstrap-css');
        Asset::add('cookies', 'lib/js/jquery.cookie.js');
        parent::__construct();

        View::share('title', 'Biblionarrator');

        Breadcrumbs::build();
    }

    /**
     * Catch-all method for requests that can't be matched.
     *
     * @param  string    $method
     * @param  array     $parameters
     * @return Response
     */
    public function __call($method, $parameters)
    {
        return Response::error('404');
    }
    
    public function logRequest()
    {
        $route = Request::route();
        Log::log('request', "Controller: {$route->controller} / Action: {$route->controller_action} called at ". date('Y-m-d H:i:s'));
    }

    protected function _choose_format() {
        $format = Input::get('format');
        if (is_null($format)) {
            if (Request::accepts('application/json')) {
                $format = 'json';
            } else {
                $format = 'interface';
            }
        }
        return $format;
    }
}
