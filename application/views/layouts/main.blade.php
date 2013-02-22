<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>Biblionarrator</title>
        {{ Asset::styles() }}
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
                            <li class=""><a href="/lists">Lists</a></li>
                            <li class=""><a href="/search">Search</a></li>
                            <li class="divider-vertical"></li>
                            <form class="navbar-search" action="/search" method="get" accept-charset="UTF-8">
                                <input type="text" class="search-query" placeholder="Quick search">
                            </form>
                        </ul>
                        <ul class="nav pull-right">
                            <li class="dropdown">
                                <a href="#" class="dropdown-toggle" data-toggle="dropdown"><i class="icon-user"></i>
                                    @if ( Auth::check() )
                                        {{ Auth::user()->username }}
                                    @endif
                                    <b class="caret"></b>
                                </a>
                                <ul class="dropdown-menu">
                                    @if ( Auth::guest() )
                                        <form id="navbarLogin" action="/user/login" method="post" accept-charset="UTF-8">
                                            <input id="navbarLoginUser" type="text" name="user[username]" placeholder="Username"></input>
                                            <input id="navbarLoginPassword" type="password" name="user[password]" placeholder="Password"></input>
                                            <button id="navbarLoginSubmit" class="btn btn-primary btn-small" type="submit">Sign in</button>
                                        </form>
                                    @else
                                    <li><a href="/user/preferences">Preferences</a></li>
                                    @endif
                                </ul>
                            </li>
                            <li class="dropdown">
                                <a href="#" class="dropdown-toggle" data-toggle="dropdown"><i class="icon-wrench"></i><b class="caret"></b></a>
                                <ul class="dropdown-menu">
                                    <li><a href="/admin">Home</a></li>
                                    <li><a href="/admin/fields">Fields</a></li>
                                    <li><a href="/admin/users">Users</a></li>
                                </ul>
                            </li>
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
                        @include('plugins.loggedin_postnav')
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
                    @include('plugins.status')
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
        @if (Auth::check())
            @include('plugins.upload_modal')
        @endif
        @yield_section
        
        {{ Asset::scripts() }}
        @section('scripts')
        @yield_section
    </body>
</html>
