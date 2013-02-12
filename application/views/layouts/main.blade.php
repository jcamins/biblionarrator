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
                <div class="container">
                    <a class="brand" href="/">Biblionarrator</a>
                    <div class="nav-collapse">
                        <ul class="nav">
                            @section('navigation')
                            @yield_section
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

        <div class="container">
            @include('plugins.status')
            @yield('content')
            <hr>
            <footer>
            <p>&copy; C &amp; P Bibliography Services 2013</p>    
            </footer>
        </div> <!-- /container -->

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
