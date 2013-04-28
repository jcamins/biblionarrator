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

class Css_Controller extends Base_Controller {

    public $restful = true;

    public function get_fields () {
        $styles = array();
        $fields = array();
        foreach (Style::with('Field')->get() as $style) {
            array_push($styles, array( 'field' => $style->field->to_array(), 'css' => $style->css));
        }
        foreach (Field::all() as $field) {
            array_push($fields, $field->to_array());
        }
        return Response::make(View::make('fields-css', array( 'styles' => $styles, 'fields' => $fields ))->render(), 200, array('Content-Type' => 'text/css'));
    }
}
