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
                        <ul class="nav">
                            @section('navigation')
                            @yield_section
                        </ul>
                        <form class="navbar-search pull-right">
                            <input type="text" class="search-query" placeholder="Search">
                        </form>
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
                    @yield('sidebar')
                    @include('plugins.status')
                </div>
                <div class="span10">
                    @yield('content')
                </div>
            </div>
        </div> <!-- /container -->
        <hr>
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
