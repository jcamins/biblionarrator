@layout('layouts/main')

@section('navigation')
@parent
@endsection

@section('content')
<div class="hero-unit">
    <div class="row-fluid">
        <div class="span6">
            <form id="login" action="/user/login" method="post" accept-charset="UTF-8">
                <input type="text" name="username" placeholder="Username"></input>
                <input type="password" name="password" placeholder="Password"></input>
                <input type="hidden" name="redirect" value="{{ URI::current() }}"></input>
                <button class="btn btn-primary" type="submit">Sign in</button>
            </form>
        </div>
    </div>
</div>
@endsection
