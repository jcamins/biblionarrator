<?php

return array(

    /*
    |--------------------------------------------------------------------------
    | Initialize User Permissions Based On Roles
    |--------------------------------------------------------------------------
    |
    | This closure is called by the Authority\Ability class' "initialize" method
    |
    */

    'initialize' => function($user)
    {
        // The initialize method (this Closure function) will be ran on every page load when the bundle get's started.
        // A User Object will be passed into this method and is available via $user
        // The $user variable is a instantiated User Object (application/models/user.php)

        // First, let's group together some "Actions" so we can later give a user access to multiple actions at once
        /*Authority::action_alias('manage', array('create', 'view', 'update', 'delete'));
        Authority::action_alias('edit', array('create', 'update', 'delete'));*/
        Authority::action_alias('catalog', array('edit', 'view'));


        // If a user doesn't have any roles, we don't have to give him permissions so we can stop right here.
        //if(count($user->roles) === 0) return false;

        Authority::allow('view', 'Record');/*, function ($that_record) use ($user)
        {
            error_log($that_record->collection()->first()->id);
            if (isset($that_record->id) && 
                $that_record->collection()->first()->id === $user->collection()->first()->id) {
                     return true;
            }
        });*/

        if($user->has_role('cataloger'))
        {
            Authority::allow('catalog', 'Record', function ($that_record) use ($user)
            {
                if (isset($that_record->id)) {
                    if ($that_record->collection()->first()->id === $user->collection()->first()->id) return true;
                    return false;
                } else {
                    return true;
                }
            });
        };


        /*Authority::allow('update', 'Record', function ($that_record) use ($user)
        {
            if (isset($that_record->id) &&
                ($that_record->collection()->first()->security === 'Open' ||
                $that_record->collection()->first()->id === $user->collection()->first()->id)) {
                return true;
            } else {
                return false;
            }
        });

        Authority::allow('create', 'Record', function () use ($user)
        {
            return true;
        });

        Authority::allow('delete', 'Record', function ($that_record) use ($user)
        {
            if (isset($that_record->id) &&
                $that_record->collection()->first()->id === $user->collection()->first()->id) {
                return true;
            } else {
                return false;
            }
        });*/

        if($user->has_role('manager') || $user->has_role('administrator'))
        {
            // The logged in user is an admin, we allow him to perform manage actions (create, read, update, delete) on "all" "Resources".
            Authority::allow('manage', 'all', function ($that_resource) use ($user) {
                if ($user->has_role('administrator')) return true;
                if (isset($that_resource->id) && isset($that_resource->collection)) {
                    if ($that_resource->collection()->first()->id === $user->collection()->first()->id) return true;
                    return false;
                } else {
                    return true;
                }
            });
            // Authority::allow('edit', 'all');

            // Let's say we want to "Deny" the admin from adding accounts if his age is below 21 (i don't mean to discriminate ;) 
            // Since we have the User object, and it has an "age" property, we can make a simple if statement.

            // Let's make it a little harder, we don't want the admin to be able to delete his own User account, but has to be allowed to delete other Users.
            // We only know that the "Resource" is a User, But we don't know the User id, we can send that information to the Rule Closure, in the Closure below, the argument is called $that_user.
            // We also pass in the logged in user, since the Closure is outside of the scope where this comment is in.
            Authority::deny('delete', 'User', function ($that_user) use ($user)
            {
                // If the id of the User that we are trying to delete is equal to our logged in user, we return true, meaning the Deny Rule will be set.
                return (int)$that_user->id === (int)$user->id;
            });
        }

    }

);
