<?php

class Breadcrumbs
{
    protected static $crumbs = array();
    public static function build()
    {
        if (Session::has('breadcrumbs')) {
            self::$crumbs = Session::get('breadcrumbs');
        }
        $html = '<ul class="breadcrumb">';
        $count = count(self::$crumbs);
        $key = 0;
        foreach (self::$crumbs as $entry) {
            if (URL::full() == $entry[1]) {
                $html .= '<li class="active">' . $entry[0];
            } else {
                $html .= '<li><a href="' . $entry[1] . '">' . $entry[0] . '</a>';
                if ($key < $count - 1) {
                    $html .= ' <span class="divider">/</span>';
                }
            }
            $html .= '</li>';
            $key++;
        }
        $html .= '</ul>';
        View::share('breadcrumb', $html);
    }

    public static function add($title, $url = null)
    {
        if (is_null($url)) {
            $url = URL::full();
        }
        if (Session::has('breadcrumbs')) {
            self::$crumbs = Session::get('breadcrumbs');
        }
        foreach (self::$crumbs as $key => $entry) {
            if ($entry[1] == $url) {
                unset(self::$crumbs[$key]);
            }
        }
        array_push(self::$crumbs, array($title, $url));
        while (count(self::$crumbs) > 6) {
            array_shift(self::$crumbs);
        }
        Session::put('breadcrumbs', self::$crumbs);
        self::build();
    }

}
