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
class Field extends Eloquent
{
    public static $timestamps = true;

    public static function by_label($label)
    {
        $parts = explode('_', $label);
        if (count($parts) === 2) {
            return Field::where_schema($parts[0])->where_field($parts[1])->first();
        }
    }

    public static function roots()
    {
        return Field::where_null('parent');
    }

    public static function structured_list()
    {
        $fields = array();
        foreach (Field::all() as $field) {
            array_push($fields, $field->to_array());
        }
        return $fields;
    }

    public function styles()
    {
        return $this->has_many('Style', 'field_id');
    }

    public function parent()
    {
        return $this->belongs_to('Field', 'parent');
    }

    public function children()
    {
        return $this->has_many('Field', 'parent');
    }

    public function links()
    {
        return $this->has_many_and_belongs_to('RecordType', 'field_links');
    }
}
