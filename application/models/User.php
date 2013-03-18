<?php
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

