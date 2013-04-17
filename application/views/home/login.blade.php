@layout('layouts/main')

@section('navigation')
@parent
@endsection

@section('content')
<div class="row-fluid">
    <div class="span6">
        <form id="login" action="/user/login" method="post" accept-charset="UTF-8">
            <fieldset>
                <legend>Log in to Biblionarrator</legend>
                @if (Session::has('status_error'))
                    <div class="alert alert-error">
                        <button type="button" class="close" data-dismiss="alert">&times;</button>
                        {{ Session::get('login_error') }}
                    </div>
                @endif
                <div class="control-group">
                    <input type="text" id="login-username" name="username" placeholder="User name"></input>
                </div>
                <div class="control-group">
                    <input type="password" id="login-password" name="password" placeholder="Password"></input>
                </div>
                <input type="hidden" name="redirect" value="{{ URI::current() }}"></input>
                <button class="btn btn-small btn-primary" type="submit">Sign in</button>
            </fieldset>
        </form>
    </div>
</div>
@endsection
