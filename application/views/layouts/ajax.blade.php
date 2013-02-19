<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>Biblionarrator</title>
        {{ Asset::styles() }}
    </head>

    <body>
<!--        <div class="container">
            <div class="row">
                <div aria-describedby="ajaxLabel" class="span6 well well-large">-->
                    @yield('content')
<!--                </div>
            </div>
        </div>-->

        {{ Asset::scripts() }}
        @section('scripts')
        @yield_section
    </body>
</html>
