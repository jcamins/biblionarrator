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
class Style extends Eloquent
{
    public static $timestamps = true;

    public static function structured_list()
    {
        $styles = array();
        foreach (Style::with('Field')->get() as $style) {
            array_push($styles, array_merge( $style->to_array(), array('field' => $style->field->to_array())));
        }
        return $styles;
    }

    public function field() {
        return $this->belongs_to('Field', 'field_id');
    }

    public function recordtypes() {
        return $this->has_many_and_belongs_to('RecordType');
    }
}
