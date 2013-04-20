<?php

class URL extends Laravel\URL
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

    public static function merge($url, $oldparams, $newparams) {
        foreach ($newparams as $key => $val) {
            $oldparams[$key] = $val;
        }

        return $url . '?' . http_build_query($oldparams);
    }
}

