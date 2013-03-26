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
                    <a class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                    </a>
                    <a class="brand" href="/">Biblionarrator</a>
                    <div class="nav-collapse">
                        <ul class="nav pull-left">
                            @section('navigation')
                            @yield_section
                            <li class=""><a href="/record">Record</a></li>
                            <li class=""><a class="caret-before" href="/search">Search</a></li>
                            <li class="dropdown">
                                <a href="#" class="dropdown-toggle caret-after" data-toggle="dropdown"><b class="caret"></b></a>
                                <ul class="dropdown-menu">
                                    <li><span>Saved searches</span></li>
                                </ul>
                            </li>
                            <li class="divider-vertical"></li>
                            <li><form class="navbar-search" action="/search" method="get" accept-charset="UTF-8">
                                <input type="text" class="search-query" name="q" placeholder="Quick search" value="@if (isset($query)){{ $query }}@endif"></input>
                            </form></li>
                        </ul>
                        <ul class="nav pull-right">
                            <li class="dropdown"><a href="/bookmarks"><i class="icon-bookmark"></i><span id="bookmark-count">
@if (strlen(Session::get('bookmarks')) > 0)
{{ count(explode(',', Session::get('bookmarks'))) }}
@endif
</span></a>
                            <ul id="bookmark-dropdown" class="dropdown-menu"><li><span id="bookmark-message"></span></li></ul>
                            </li>
                            <li class="dropdown">
                                <a href="#" class="dropdown-toggle" data-toggle="dropdown">
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
                            <li class="dropdown">
                                <a href="#" class="dropdown-toggle" data-toggle="dropdown"><i class="icon-wrench"></i><b class="caret"></b></a>
                                <ul class="dropdown-menu">
                                    <li><a href="/admin">Home</a></li>
                                    @if ( Authority::can('manage', 'Field') )
                                    <li><a href="/resources/field/admin">Fields</a></li>
                                    @endif
                                    @if ( Authority::can('manage', 'User') )
                                    <li><a href="/resources/user/admin">Users</a></li>
                                    @endif
                                    @if ( Authority::can('manage', 'Collection') )
                                    <li><a href="/resources/collection/admin">Collections</a></li>
                                    @endif
                                </ul>
                            </li>
                            @endif
                            <li class="dropdown">
                                <a href="#" class="dropdown-toggle" data-toggle="dropdown"><i class="icon-question-sign"></i><b class="caret"></b></a>
                                <ul class="dropdown-menu">
                                    <li><a href="/home/about">About</a></li>
                                </ul>
                            </li>
                        </ul>
                    </div><!--/.nav-collapse -->
                    @section('post_navigation')
                    @if (Auth::check())
                    @endif
                    @yield_section
                </div>
            </div>
        </div>

        <div class="container-fluid">
            <div class="row-fluid">
                <div class="span2">
                    @yield('sidetoolbar')
                </div>
                <div class="span10">
                    @yield('toolbar')
                </div>
            </div>
            <div class="row-fluid">
                <div class="span2">
                    @yield('sidebar')
                </div>
                <div class="span10">
                    @yield('content')
                </div>
            </div>
        </div> <!-- /container -->
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
