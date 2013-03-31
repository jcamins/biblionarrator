<?php

class Redirect extends Laravel\Redirect
{
    public static function with_querystring( $url = null )
    {
        // Do we want to preserve the query strings ?
        //
        $url .= ( ! empty( $_SERVER['QUERY_STRING'] ) ? '?' . $_SERVER['QUERY_STRING'] : '' );

        // Return the URL.
        //
        return parent::to( $url );
    }
}
