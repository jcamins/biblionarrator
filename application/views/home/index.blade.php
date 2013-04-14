@layout('layouts/main')

@section('navigation')
@parent
@endsection

@section('content')
    <div class="row-fluid">
        <div class="span6">
            <div class="hero-unit">
                <h2>Welcome to Biblionarrator</h2>
                <p>Biblionarrator turns traditional assumptions about cataloging
                on their heads and makes catalogs (and cataloging) fun again.</p>
                <p><a href="/about" class="btn btn-primary btn-large">Learn more &raquo;</a></p>
            </div>
        </div>
        <div class="span6">
            <h4>Common tasks</h4>
            <ul class="home-links">
                @if (Auth::guest())
                <li><a href="/user/login">Log in</a></li>
                @endif
                <li><a href="/search">Search catalog</a></li>
                @if (Authority::can('edit', 'Record'))
                <li><a href="/record/new">Create new record</a></li>
                @endif
                @if (Auth::check() && Auth::user()->has_role('administrator'))
                <li><a href="/admin">Administer system</a></li>
                @endif
            </ul>
        </div>
    </div>
@endsection
