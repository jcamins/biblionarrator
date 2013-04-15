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
class User extends Eloquent {

    public static $timestamps = true;
    public static $hidden = array('password');

    public function collection()
    {
        return $this->belongs_to('Collection', 'collection_id');
    }

    public function roles()
    {
        return $this->has_many_and_belongs_to('Role', 'role_user');
    }

    public function settings() {
        return $this->has_many('UserSettings', 'user_id');
    }

    public function templates() {
        return $this->has_many('Template', 'owner_id');
    }

    public function has_role($key)
    {
        foreach($this->roles as $role)
        {
            if($role->name == $key)
            {
                return true;
            }
        }

        return false;
    }

    public function has_any_role($keys)
    {
        if( ! is_array($keys))
        {
            $keys = func_get_args();
        }

        foreach($this->roles as $role)
        {
            if(in_array($role->name, $keys))
            {
                return true;
            }
        }

        return false;
    }

    public function to_array ()
    {
        $array = parent::to_array();
        $array['collection'] = $this->collection->name;
        return $array;
    }
}

