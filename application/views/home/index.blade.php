@layout('layouts/main')

@section('sidebar')
<div class="instructions">
<span class="instruction-label">Hint:</span>
Almost everything you need to do can be done from the toolbars:
<ul>
<li>The &#8220;Record&#8221; button creates a new record</li>
<li>The &#8220;Search&#8221; button brings you to the search page (or you can
just do a Quick search directly from the toolbar)</li>
<li><i class="icon-bookmark"></i> gives you access to your bookmarks</li>
<li><i class="icon-user"></i> is home base for your user</li>
<li><i class="icon-wrench"></i> lets you administer the system, if you are
allowed</li>
</ul>
You can disable these hints from the <i class="icon-question-sign"></i> menu.
</div>
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
