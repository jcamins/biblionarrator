<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>Biblionarrator</title>
        <script src="/js/html5shiv.js"></script>
        <script src="/js/html5shiv-printshiv.js"></script>
        <!--[if lt IE 9]>
            <link rel="stylesheet" type="text/css" href="/css/style-ie.css" />
        <![endif]-->

        {{ Asset::styles() }}
        @section('styles')
        @yield_section
    </head>

    <body>
        <div class="navbar navbar-fixed-top">
            <div class="navbar-inner">
                <div class="container-fluid">
                    <a class="brand" href="/">Biblionarrator</a>
                    <div>
                        <ul class="nav pull-left">
                            @section('navigation')
                            @yield_section
                            <li class=""><a href="/record">Record</a></li>
                            <li class=""><a class="caret-before" href="/search">Search</a></li>
                            <li class="hidden-phone dropdown">
                                <a href="#" class="dropdown-toggle caret-after" data-toggle="dropdown"><b class="caret"></b></a>
                                <ul class="dropdown-menu">
                                    <li><span>Saved searches</span></li>
                                </ul>
                            </li>
                            <li class="divider-vertical"></li>
                            <li class="visible-desktop visible-tablet"><form class="navbar-search" action="/search" method="get" accept-charset="UTF-8">
                                <input type="text" class="search-query" name="q" placeholder="Quick search" value="@if (isset($query)){{ $query }}@endif"></input><button class="search-button" type="submit"><i class="icon-search"></i></button>
                            </form></li>
                        </ul>
                        <ul class="nav pull-right">
                            <li class="dropdown visible-desktop"><a href="/bookmarks"><i class="icon-bookmark"></i><span class="bookmark-count">
@if (strlen(Session::get('bookmarks')) > 0)
{{ count(explode(',', Session::get('bookmarks'))) }}
@endif
</span></a>
                            <ul id="bookmark-dropdown" class="dropdown-menu"><li><span id="bookmark-message"></span></li></ul>
                            </li>
                            <li class="dropdown">
                                <a href="/user" class="hidden-desktop"><i class="icon-user"></i></a>
                                <a href="#" class="dropdown-toggle visible-desktop" data-toggle="dropdown">
                                    <i class="icon-user"></i><b class="caret"></b>
                                </a>
                                <ul class="dropdown-menu">
                                    @if ( Auth::guest() )
                                        <form id="navbarLogin" action="/user/login" method="post" accept-charset="UTF-8">
                                            <input id="navbarLoginUser" type="text" name="username" placeholder="Username"></input>
                                            <input id="navbarLoginPassword" type="password" name="password" placeholder="Password"></input>
                                            <input type="hidden" name="redirect" value="{{ URI::current() }}"></input>
                                            <button id="navbarLoginSubmit" class="btn btn-primary btn-small" type="submit">Sign in</button>
                                        </form>
                                    @else
                                    <li><span>{{ Auth::user()->email }}</span></li>
                                    <li><a href="/user/preferences">Preferences</a></li>
                                    <li class="divider"></li>
                                    <li><a href="/user/logout">Sign out</a></li>
                                    @endif
                                </ul>
                            </li>
                            @if ( Auth::check() )
                            <li class="dropdown visible-desktop">
                                <a href="#" class="dropdown-toggle" data-toggle="dropdown"><i class="icon-wrench"></i><b class="caret"></b></a>
                                <ul class="dropdown-menu">
                                    <li><a href="/admin">Home</a></li>
                                    @if ( Authority::can('manage', 'Field') )
                                    <li><a href="/admin/field">Fields</a></li>
                                    @endif
                                    @if ( Authority::can('manage', 'User') )
                                    <li><a href="/admin/user">Users</a></li>
                                    @endif
                                    @if ( Authority::can('manage', 'Collection') )
                                    <li><a href="/admin/collection">Collections</a></li>
                                    @endif
                                    @if ( Authority::can('manage', 'RecordType') )
                                    <li><a href="/admin/recordtype">Record types</a></li>
                                    @endif
                                </ul>
                            </li>
                            @endif
                            <li class="dropdown visible-desktop">
                                <a href="#" class="dropdown-toggle" data-toggle="dropdown"><i class="icon-question-sign"></i><b class="caret"></b></a>
                                <ul class="dropdown-menu">
                                    <li><a href="/home/about">About</a></li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div id="controlbar" class="navbar-inner">
                <div class="container-fluid">
                @section('controlbar')
                @yield_section
                </div>
            </div>
        </div>

        <div class="container-fluid">
            <div class="row-fluid">
                <div class="span10 pull-right">
                    @yield('toolbar')
                </div>
                <div class="span2 pull-left">
                    @yield('sidetoolbar')
                </div>
            </div>
            <div class="row-fluid">
                <div class="span10 pull-right">
                    @yield('content')
                </div>
                <div class="span2 pull-left">
                    @yield('sidebar')
                </div>
            </div>
        </div> <!-- /container -->
        <div class="navbar navbar-fixed-bottom hidden-desktop">
            <div class="navbar-inner">
            <ul class="nav">
                <li><a href="/bookmarks">Bookmarks
                    <span class="bookmark-count"><?php strlen(Session::get('bookmarks')) > 0 ? count(explode(',', Session::get('bookmarks'))) : '' ?></span></a></li>

                <li><a href="/user">
                @if (Auth::guest())
                    Log in
                @else
                    User preferences
                @endif
                </a></li>
                @if (Auth::check())
                <li><a href="/admin">System administration</a></li>
                @endif
                <li><a href="/help">Help</a></li>
            </ul>
            </div>
        </div>
        <footer>
        <p>&copy; C &amp; P Bibliography Services 2013</p>    
        </footer>
        @section('form_modals')
        @yield_section
        
        {{ Asset::scripts() }}
        @section('scripts')
        @yield_section
    </body>
</html>
